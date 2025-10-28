package com.shopifaille.checkout.service;

import com.google.protobuf.Timestamp;
import com.shopifaille.checkout.client.CoreGateway;
import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.entity.Discount;
import com.shopifaille.checkout.repository.CartRepository;
import com.shopifaille.checkout.repository.DiscountRepository;
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

    public boolean applyDiscount(String cartId, String discountCode) {
        Cart cart = cartService.getCartById(cartId)
                .orElseThrow(() -> {
                    log.error("Cart with id {} not found for discount application", cartId);
                    return new IllegalStateException("Cart not found.");
                });

        // check the discount code validity with the core client stub
        CheckDiscountResponse response = coreGateway.validateDiscountCode(discountCode);
        if (!response.getIsValid()) {
            log.warn("Discount code {} is invalid according to Core.", discountCode);
            return false;
        }

        Discount discount = createDiscount(cart, discountCode, response);
        cart.getDiscounts().add(discount);
        cart.setDateModified(new Date());
        cartRepository.save(cart);

        log.info("Successfully applied discount {} to cart {}. Value: {} {}", discountCode, cartId, response.getValue(), response.getType());
        return true;
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
