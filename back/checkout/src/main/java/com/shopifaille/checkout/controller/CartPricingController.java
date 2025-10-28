package com.shopifaille.checkout.controller;

import com.shopifaille.checkout.service.CartPricingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/carts")
public class CartPricingController {

    private final CartPricingService cartPricingService;

    public CartPricingController(CartPricingService cartPricingService) {
        this.cartPricingService = cartPricingService;
    }

    @PostMapping("/{cartId}/discount/{discountCode}")
    public ResponseEntity<String> applyDiscount(@PathVariable String cartId, @PathVariable String discountCode) {
        boolean discountApplied = cartPricingService.applyDiscount(cartId, discountCode);
        if (!discountApplied) {
            return new ResponseEntity<>(cartId, HttpStatus.NOT_ACCEPTABLE);
        }
        return  new ResponseEntity<>(cartId, HttpStatus.ACCEPTED);
    }
}
