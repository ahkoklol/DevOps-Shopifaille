package com.shopifaille.checkout.service;

import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository, CartRepository cartRepository1) {
        this.cartRepository = cartRepository1;
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
}
