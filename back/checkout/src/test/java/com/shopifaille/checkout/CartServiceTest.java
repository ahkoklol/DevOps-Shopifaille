package com.shopifaille.checkout;

import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.service.CartService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
public class CartServiceTest extends PostgresTestcontainer {

    @Autowired
    private CartService cartService;

    @Test
    void testCreateCart_Success() {
        String cartId = cartService.createCart("teststoreid");
        Optional<Cart> cart = cartService.getCart(cartId);

        assertThat(cart).isPresent();
        assertThat(cart.get().getCartItems()).isEmpty();

    }
}
