package com.shopifaille.checkout.controller;

import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.service.CartService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts")
public class CartController {

    private static final Logger log = LoggerFactory.getLogger(CartController.class);

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/{storeId}")
    public ResponseEntity<String> createCart(@PathVariable String storeId) {
        String cartId = cartService.createCart(storeId); // create empty cart
        return new ResponseEntity<>(cartId, HttpStatus.CREATED);
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCart(@PathVariable String cartId) {
        log.info("Fetching cart with id {}", cartId);
        return cartService.getCartById(cartId)
                .map(ResponseEntity::ok) // 200 OK with body
                .orElseGet(() -> ResponseEntity.notFound().build()); // 404 Not Found
    }

}
