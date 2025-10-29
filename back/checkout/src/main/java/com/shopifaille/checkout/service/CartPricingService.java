package com.shopifaille.checkout.service;

import com.google.protobuf.Timestamp;
import com.shopifaille.checkout.client.CoreGateway;
import com.shopifaille.checkout.entity.*;
import com.shopifaille.checkout.repository.CartRepository;
import com.shopifaille.core.grpc.CheckDiscountRequest;
import com.shopifaille.core.grpc.CheckDiscountResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class CartPricingService {

    private static final Logger log = LoggerFactory.getLogger(CartPricingService.class);

    private final CartRepository cartRepository;
    private final CartService cartService;
    private final CoreGateway coreGateway;

    public CartPricingService(CartRepository cartRepository, CartService cartService, CoreGateway coreGateway) {
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.coreGateway = coreGateway;
    }

    /**
     * Applies discount to a cart
     * @param cartId the id of the cart
     * @param discountCode the discount code
     * @return true if the discount was applied, false otherwise
     */
    public boolean applyDiscount(String cartId, String discountCode) {
        Cart cart = cartService.getCartById(cartId)
                .orElseThrow(() -> {
                    log.error("Cart with id {} not found for discount application", cartId);
                    return new IllegalStateException("Cart not found.");
                });

        // check the discount code validity with the core client stub
        CheckDiscountRequest checkDiscountRequest = CheckDiscountRequest.newBuilder()
                .setCode(discountCode)
                .build();
        CheckDiscountResponse checkDiscountResponse = coreGateway.validateDiscountCode(checkDiscountRequest);
        if (!checkDiscountResponse.getIsValid()) {
            log.warn("Discount code {} is invalid according to Core.", discountCode);
            return false;
        }

        Discount discount = createDiscount(cart, discountCode, checkDiscountResponse);
        cart.getDiscounts().add(discount);
        cart.setDateModified(new Date());
        cartRepository.save(cart);

        log.info("Successfully applied discount {} to cart {}. Value: {} {}", discountCode, cartId, checkDiscountResponse.getValue(), checkDiscountResponse.getType());
        return true;
    }

    /**
     * Saves the shipping detail
     * @param cartId the id of the cart
     * @param shippingDetail the shipping detail
     * @return a ShippingDetail object with the shipping information
     */
    public ShippingDetail saveShippingDetail(String cartId, ShippingDetail shippingDetail) {
        Cart cart = cartService.getCartById(cartId)
                .orElseThrow(() -> {
                    log.error("Cart with id {} not found for discount application", cartId);
                    return new IllegalStateException("Cart not found.");
                });

        ShippingDetail detail = cart.getShippingDetail() != null ? cart.getShippingDetail() : new ShippingDetail();
        detail.setCart(cart);
        detail.setBuyerFirstName(shippingDetail.getBuyerFirstName());
        detail.setBuyerLastName(shippingDetail.getBuyerLastName());
        detail.setBuyerEmail(shippingDetail.getBuyerEmail());
        detail.setAddress(shippingDetail.getAddress());
        detail.setCost(5.00);
        detail.setDate(new Date());

        // check for shipping cost discount
        boolean isFreeShippingApplied = cart.getDiscounts().stream()
                .anyMatch(discount -> calculateShipping(discount.getCode()));
        if (isFreeShippingApplied) {
            detail.setCost(0.0);
            log.info("Free shipping applied for cart {}", cartId);
        }

        cart.setShippingDetail(detail);
        cart.setDateModified(new Date());
        cartRepository.save(cart);

        return detail;
    }

    /**
     * Checks if the discount code for shipping cost is valid
     * @param discountCode the discount code
     * @return true if the code is valid, false otherwise
     */
    private boolean calculateShipping(String discountCode) {
        return discountCode.equalsIgnoreCase("SHIPPING25");
    }

    /**
     * Fetches all information relative to the order summary
     * @param cartId the id of the cart
     * @return the Summary object of the transaction
     */
    public Summary getSummary(String cartId) {
        Cart cart = cartService.getCartById(cartId)
                .orElseThrow(() -> {
                    log.error("Cart with id {} not found summary", cartId);
                    return new IllegalStateException("Cart not found.");
                });

        if (cart.getCartItems().isEmpty()) {
            log.warn("No items in cart with id {}", cartId);
            throw new IllegalStateException("No items in cart with id " + cartId);
        }

        if (cart.getShippingDetail() == null) {
            log.error("Shipping details are required for summary calculation in cart {}", cartId);
            throw new IllegalStateException("Shipping details must be set before calculating summary.");
        }

        // 1. CALCULATE GROSS SUBTOTAL
        int totalItems = cart.getCartItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        // Subtotal before any discounts
        double subtotalGross = cart.getCartItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        // 2. CALCULATE TOTAL DISCOUNT AMOUNT

        // FIX: Line-item discount AMOUNT. Formula: Price * Quantity * (Item Discount Percentage / 100)
        double itemDiscountAmount = cart.getCartItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity() * (item.getDiscount() / 100.0))
                .sum();

        // General discount AMOUNT (Only used for shipping cost reduction based on your rules,
        // but its fixed monetary value is summed here)
        double generalCouponDiscountAmount = cart.getDiscounts().stream()
                .mapToDouble(Discount::getValue)
                .sum();

        // Total monetary discount deducted from the subtotal
        double totalDiscountAmount = itemDiscountAmount + generalCouponDiscountAmount;

        // 3. CALCULATE NET TAXABLE BASE
        double shippingCost = cart.getShippingDetail().getCost();

        // Net Taxable Base = (Subtotal Gross - Total Discount Amount) + Shipping Cost
        double netTaxableBase = subtotalGross - totalDiscountAmount + shippingCost;


        // 4. CALCULATE TAXES (Standard 20% on the net taxable base)
        double totalTaxAmount = netTaxableBase * 0.20;

        // 5. CALCULATE FINAL TOTAL (TTC)
        double finalTotal = netTaxableBase + totalTaxAmount;

        Summary summary = new Summary();
        summary.setSummaryId(UUID.randomUUID().toString());
        summary.setCartId(cartId);
        summary.setCartItems(cart.getCartItems());
        summary.setTotalItemCount(totalItems);
        summary.setShippingAddress(cart.getShippingDetail().getAddress());
        summary.setSubtotalItems(subtotalGross); // Total before discounts
        summary.setTotalDiscountAmount(totalDiscountAmount); // Total amount deducted
        summary.setShippingCost(shippingCost);
        summary.setTotalTaxAmount(totalTaxAmount);
        summary.setTotal(finalTotal); // Final price TTC
        return summary;
    }

    /**
     * Creates a Discount
     * @param cart the Cart where the discount has to be applied
     * @param code the discount code
     * @param response the response from the gRPC core stub
     * @return a Discount object
     */
    private Discount createDiscount(Cart cart, String code, CheckDiscountResponse response) {
        Discount discount = new Discount();
        discount.setDiscountId(UUID.randomUUID().toString());
        discount.setCart(cart);
        discount.setCode(code);
        discount.setType(response.getType());
        discount.setValue(response.getValue());
        discount.setActive(response.getIsActive());
        discount.setStartDate(convertTimestampToDate(response.getStartDate()));
        discount.setEndDate(convertTimestampToDate(response.getEndDate()));
        return discount;
    }

    /**
     * Converts a Protobuf Timestamp object to a java.util.Date object.
     * @param timestamp a google.protobuf.Timestamp
     * @return a java.util.Date
     */
    private Date convertTimestampToDate(Timestamp timestamp) {
        if (timestamp == null || (timestamp.getSeconds() == 0 && timestamp.getNanos() == 0)) {
            return null;
        }
        return Date.from(Instant.ofEpochSecond(timestamp.getSeconds(), timestamp.getNanos()));
    }
}
