package com.shopifaille.checkout.service;

import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.entity.CartItem;
import com.shopifaille.checkout.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    /**
     * Creates a cart
     * @param storeId the store id for which the cart is created
     * @return the id of the created cart
     */
    public String createCart(String storeId) {
        Cart cart = new Cart();
        cart.setCartId(UUID.randomUUID().toString());
        Date date = new Date();
        cart.setStoreId(storeId);
        cart.setStatus("Active");
        cart.setDateCreated(date);
        cart.setDateModified(date);
        cartRepository.save(cart);
        log.info("Cart created");
        return cart.getCartId();
    }

    /**
     * Fetches a cart by id
     * @param cartId the id of the cart to fetch
     * @return a Cart object or null
     */
    public Optional<Cart> getCartById(String cartId) {
        return cartRepository.findById(cartId);
    }

    /**
     * Adds a CartItem to the cart
     * @param cartId the id of the cart
     * @param item a CartItem
     */
    public void addItemToCart(String cartId, CartItem item) {
        Optional<Cart> cart = getCartById(cartId);

        if (cart.isEmpty()) {
            log.error("Cart with id {} not found", cartId);
            throw new IllegalStateException("Cart with id " + cartId + " not found");
        }

        // check if item exists in cart
        Optional<CartItem> existingItem = cart.get().getCartItems().stream()
                .filter(i -> i.getProductId().equals(item.getProductId()) &&
                        i.getVariantId().equals(item.getVariantId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // if item already exists, increment quantity by 1
            CartItem itemToUpdate = existingItem.get();
            itemToUpdate.setQuantity(itemToUpdate.getQuantity() + item.getQuantity());
            log.info("Item already exists, updated quantity for item {} in cart {}", itemToUpdate.getCartItemId(), cartId);
        } else {
            // else add the item to cart
            item.setCartItemId(UUID.randomUUID().toString());
            item.setCart(cart.get());
            log.info("Added new item {} to cart {}", item.getProductId(), cartId);
        }

        cart.get().setDateModified(new Date());
        cartRepository.save(cart.get());
    }

    /**
     * Modifies the quantity of a CartItem in Cart
     * @param cartId the id of the cart
     * @param itemId the id of a CartItem
     * @param quantity the new quantity of the CartItem
     */
    public void modifyCartItemQuantity(String cartId, String itemId, int quantity) {
        Optional<Cart> cart = getCartById(cartId);

        if (cart.isEmpty()) {
            log.error("Cart with id {} not found", cartId);
            throw new IllegalStateException("Cart with id " + cartId + " not found");
        }

        if (quantity <= 0) {
            log.error("Invalid quantity {} provided for item {}. Use DELETE endpoint to remove the item.", quantity, itemId);
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }

        // check if item exists in cart
        Optional<CartItem> existingItem = cart.get().getCartItems().stream()
                .filter(i -> i.getCartItemId().equals(itemId))
                .findFirst();

        if (existingItem.isEmpty()) {
            log.error("Item with id {} not found in cart {}", itemId, cartId);
            throw new IllegalStateException("Item with id " + itemId + " not found in cart " + cartId);
        }

        // check if the current quantity is the new quantity
        if (existingItem.get().getQuantity() == quantity) {
            log.warn("Item quantity is already {}", existingItem.get().getQuantity());
            return;
        }

        existingItem.get().setQuantity(quantity);
        cart.get().setDateModified(new Date());
        cartRepository.save(cart.get());
    }
}
