package com.shopifaille.checkout;

import com.google.protobuf.Timestamp;
import com.shopifaille.checkout.client.CoreGateway;
import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.entity.CartItem;
import com.shopifaille.checkout.repository.CartRepository;
import com.shopifaille.checkout.service.CartPricingService;
import com.shopifaille.checkout.service.CartService;
import com.shopifaille.core.grpc.CheckDiscountResponse;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@Transactional
public class CartPricingServiceTest extends PostgresTestcontainer {

    @Autowired
    private CartPricingService cartPricingService;

    // Mock instance injected via MockConfig
    @Autowired
    private CartService cartService;

    // Real instance (DB interaction)
    @Autowired
    private CartRepository cartRepository;

    // Mock instance injected via MockConfig (gRPC client)
    @Autowired
    private CoreGateway coreGateway;

    private final String TEST_CART_ID = "testcartid";

    // --- Configuration to replace real CartService and CoreGateway with Mocks ---
    @TestConfiguration
    static class MockConfig {
        @Bean
        CartService cartService() {
            return mock(CartService.class);
        }

        @Bean
        CoreGateway coreGateway() {
            return mock(CoreGateway.class);
        }
    }

    private Cart createBaseCart(String cartId, String storeId) {
        Cart cart = new Cart();
        cart.setCartId(cartId);
        cart.setStatus("Active");
        Date date = new Date();
        cart.setDateCreated(date);
        cart.setDateModified(date);
        cart.setStoreId(storeId);
        cart.setDiscounts(new ArrayList<>());
        return cart;
    }

    private CartItem createCartItem(String productId, String variantId) {
        CartItem item = new CartItem();
        item.setProductId(productId);
        item.setVariantId(variantId);
        item.setQuantity(1);
        item.setPrice(100.0);
        item.setDiscount(0.0);
        return item;
    }

    // mock method valid response for gRPC core service
    private CheckDiscountResponse createMockValidResponse() {
        return CheckDiscountResponse.newBuilder()
                .setIsValid(true)
                .setType("PERCENTAGE")
                .setValue(0.15)
                .setIsActive(true)
                .setStartDate(Timestamp.newBuilder().setSeconds(System.currentTimeMillis() / 1000 - 3600).build())
                .setEndDate(Timestamp.newBuilder().setSeconds(System.currentTimeMillis() / 1000 + 3600).build())
                .build();
    }

    // mock method invalid response for gRPC core service
    private CheckDiscountResponse createMockInvalidResponse() {
        return CheckDiscountResponse.newBuilder()
                .setIsValid(false)
                .build();
    }

    @BeforeEach
    void setup() {
        // Save a real cart instance to the database
        Cart baseCart = createBaseCart(TEST_CART_ID, "teststoreid");
        cartRepository.save(baseCart);

        // Reset mocks before each test
        reset(cartService, coreGateway);
    }

    @Test
    void testApplyDiscount_ValidCode_Success() {
        final String VALID_CODE = "validdiscountcode";

        // ARRANGE: Get the currently persisted Cart instance
        Optional<Cart> optionalCart = cartRepository.findById(TEST_CART_ID);
        assertTrue(optionalCart.isPresent(), "Cart must be present in DB for test setup.");
        Cart realCart = optionalCart.get();

        // 1. Stub the mocked CartService to return the tracked Cart object
        when(cartService.getCartById(TEST_CART_ID)).thenReturn(Optional.of(realCart));

        // 2. Stub the mocked CoreGateway to return a valid response
        when(coreGateway.validateDiscountCode(VALID_CODE)).thenReturn(createMockValidResponse());

        // ACT
        boolean result = cartPricingService.applyDiscount(TEST_CART_ID, VALID_CODE);

        // ASSERT
        // 1. Check method result
        assertTrue(result);

        // 2. VERIFICATION VIA DB FETCH: Check the state change in the database
        Optional<Cart> updatedCartOptional = cartRepository.findById(TEST_CART_ID);
        assertTrue(updatedCartOptional.isPresent(), "Updated cart must be present in DB.");

        Cart savedCart = updatedCartOptional.get();

        // 3. Check that the Discount was applied
        assertThat(savedCart.getDiscounts()).hasSize(1);
        assertThat(savedCart.getDiscounts().getFirst().getCode()).isEqualTo(VALID_CODE);
        assertThat(savedCart.getDiscounts().getFirst().getValue()).isEqualTo(0.15);
    }

    @Test
    void testApplyDiscount_InvalidCode_ReturnsFalse() {
        final String INVALID_CODE = "invaliddiscountcode";

        // ARRANGE: Get the currently persisted Cart instance
        Optional<Cart> optionalCart = cartRepository.findById(TEST_CART_ID);
        assertTrue(optionalCart.isPresent(), "Cart must be present in DB for test setup.");
        Cart realCart = optionalCart.get();

        // 1. Stub the CartService to return the tracked Cart object
        when(cartService.getCartById(TEST_CART_ID)).thenReturn(Optional.of(realCart));

        // 2. Stub the CoreGateway to return an invalid response
        when(coreGateway.validateDiscountCode(INVALID_CODE)).thenReturn(createMockInvalidResponse());

        // ACT
        boolean result = cartPricingService.applyDiscount(TEST_CART_ID, INVALID_CODE);

        // ASSERT
        // 1. Check method result
        assertFalse(result);

        // 2. VERIFICATION VIA DB FETCH: Check that no discount was applied
        Optional<Cart> updatedCartOptional = cartRepository.findById(TEST_CART_ID);
        assertTrue(updatedCartOptional.isPresent());

        // The discounts collection must be empty
        assertThat(updatedCartOptional.get().getDiscounts()).isEmpty();
    }

    @Test
    void testApplyDiscount_CartNotFound_ThrowsException() {
        final String NON_EXISTENT_ID = "nonExistentId";

        // ARRANGE: Stub the CartService to return empty Optional
        when(cartService.getCartById(any(String.class))).thenReturn(Optional.empty());

        // ACT & ASSERT: AssertThrows should catch the IllegalStateException
        assertThrows(IllegalStateException.class, () -> {
            cartPricingService.applyDiscount(NON_EXISTENT_ID, "discountcode");
        });
    }
}