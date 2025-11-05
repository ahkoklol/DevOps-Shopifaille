package com.shopifaille.storegateway.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api")
public class GatewayController {

    private final WebClient webClient;
    private final String productsServiceUrl;
    private final String checkoutServiceUrl;

    public GatewayController(
            @Value("${products.service.url}") String productsServiceUrl,
            @Value("${checkout.service.url}") String checkoutServiceUrl
    ) {
        this.webClient = WebClient.create();
        this.productsServiceUrl = productsServiceUrl;
        this.checkoutServiceUrl = checkoutServiceUrl;
    }

    // ============================
    // 🔍 PRODUITS
    // ============================

    @GetMapping("/products")
    public Mono<ResponseEntity<String>> getAllProducts() {
        return webClient.get()
                .uri(productsServiceUrl + "/api/products")
                .retrieve()
                .toEntity(String.class);
    }

    @GetMapping("/products/{id}")
    public Mono<ResponseEntity<String>> getProductById(@PathVariable String id) {
        return webClient.get()
                .uri(productsServiceUrl + "/api/products/" + id)
                .retrieve()
                .toEntity(String.class);
    }

    // ============================
    // 🛒 CHECKOUT
    // ============================

    @GetMapping("/cart")
    public Mono<ResponseEntity<String>> getCart() {
        return webClient.get()
                .uri(checkoutServiceUrl + "/api/cart")
                .retrieve()
                .toEntity(String.class);
    }

    @PostMapping("/cart/add")
    public Mono<ResponseEntity<String>> addToCart(@RequestBody String body) {
        return webClient.post()
                .uri(checkoutServiceUrl + "/api/cart/add")
                .bodyValue(body)
                .retrieve()
                .toEntity(String.class);
    }

    @PostMapping("/checkout/place-order")
    public Mono<ResponseEntity<String>> placeOrder(@RequestBody String body) {
        return webClient.post()
                .uri(checkoutServiceUrl + "/api/checkout/place-order")
                .bodyValue(body)
                .retrieve()
                .toEntity(String.class);
    }
}
