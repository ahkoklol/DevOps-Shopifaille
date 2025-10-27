package com.shopifaille.checkout;

import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.repository.CartRepository;
import com.shopifaille.checkout.service.CartService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Transactional
public class CartServiceTest extends PostgresTestcontainer {

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    private Cart createBaseCart(String cartId, String storeId) {
        Cart cart = new Cart();
        cart.setCartId(cartId);
        cart.setStatus("Active");
        Date date = new Date();
        cart.setDateCreated(date);
        cart.setDateModified(date);
        cart.setStoreId(storeId);
        return cart;
    }

    @BeforeEach
    void setUp() {
        // cart1
        Cart baseCart1 = createBaseCart("testcartid", "teststoreid");
        cartRepository.save(baseCart1);
    }

    @Test
    void testCreateCart_Success() {
        String cartId = cartService.createCart("teststoreid");
        Optional<Cart> cart = cartService.getCartById(cartId);

        assertThat(cart).isPresent();
        assertThat(cart.get().getCartItems()).isEmpty();
    }

    @Test
    void testGetCartById_Success() {
        Optional<Cart> cart = cartService.getCartById("testcartid");

        assertThat(cart).isPresent();
    }
}
