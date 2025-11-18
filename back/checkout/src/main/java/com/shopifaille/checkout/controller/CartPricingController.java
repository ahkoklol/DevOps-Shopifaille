package com.shopifaille.checkout.controller;

import com.shopifaille.checkout.entity.ShippingDetail;
import com.shopifaille.checkout.entity.Summary;
import com.shopifaille.checkout.service.CartPricingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/{cartId}/shipping")
    public ResponseEntity<Void> saveShippingDetail(@PathVariable String cartId, @RequestBody ShippingDetail shippingDetail) {
        cartPricingService.saveShippingDetail(cartId, shippingDetail);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{cartId}/summary")
    public ResponseEntity<Summary> getSummary(@PathVariable String cartId) {
        Summary summary = cartPricingService.getSummary(cartId);
        return ResponseEntity.ok().body(summary);
    }
}
