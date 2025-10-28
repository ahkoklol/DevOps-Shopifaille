package com.shopifaille.checkout.service;

import com.shopifaille.checkout.entity.Discount;
import com.shopifaille.checkout.repository.CartRepository;
import com.shopifaille.checkout.repository.DiscountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CartPricingService {

    private static final Logger log = LoggerFactory.getLogger(CartPricingService.class);

    private final DiscountRepository discountRepository;

    public CartPricingService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    public boolean applyDiscount(String cartId, String discoundCode) {
        return true;
    }

    private void createDiscount(Discount discount) {

    }
}
