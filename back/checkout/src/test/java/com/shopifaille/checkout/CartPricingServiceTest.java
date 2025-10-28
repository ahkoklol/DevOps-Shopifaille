package com.shopifaille.checkout;

import com.google.protobuf.Timestamp;
import com.shopifaille.checkout.client.CoreGateway;
import com.shopifaille.checkout.entity.*;
import com.shopifaille.checkout.repository.CartRepository;
import com.shopifaille.checkout.service.CartPricingService;
import com.shopifaille.checkout.service.CartService;
import com.shopifaille.core.grpc.CheckDiscountResponse;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

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
        //cartRepository.save(baseCart);
        baseCart.setShippingDetail(null);
        cartRepository.saveAndFlush(baseCart);

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

    @Test
    void testSaveShippingDetail_NewDetail_NoFreeShipping_Success() {
        // ARRANGE
        // 1. Load the base Cart from the repository (It's tracked by the session)
        Cart cartForService = cartRepository.findById(TEST_CART_ID).orElseThrow();

        // 2. CRITICAL: Explicitly ensure the current entity does NOT have ShippingDetail.
        // Since this is a @Transactional test, setting it to null here should mark the
        // existing one for removal at the end of the test, but won't cause the StaleObjectException
        // during the service call, as the service call is where the NEW one is attached.
        cartForService.setShippingDetail(null);

        // 3. Stub the CartService to return this specific (clean) instance.
        when(cartService.getCartById(TEST_CART_ID)).thenReturn(Optional.of(cartForService));

        // 4. Create the input ShippingDetail
        ShippingDetail inputDetail = new ShippingDetail();
        inputDetail.setBuyerFirstName("John");
        inputDetail.setBuyerLastName("Doe");
        inputDetail.setBuyerEmail("john.doe@example.com");
        inputDetail.setAddress("123 Test Street");

        // ACT
        // Service logic: creates new ShippingDetail, links to 'cartForService', saves cart.
        ShippingDetail savedDetail = cartPricingService.saveShippingDetail(TEST_CART_ID, inputDetail);

        // ASSERT
        // 1. Check the returned ShippingDetail properties
        assertThat(savedDetail.getCart().getCartId()).isEqualTo(TEST_CART_ID);
        assertThat(savedDetail.getBuyerFirstName()).isEqualTo("John");
        assertThat(savedDetail.getCost()).isEqualTo(5.00); // Standard cost

        // 2. Verification via DB Fetch (Must use a fresh load to verify persistence)
        Cart updatedCart = cartRepository.findById(TEST_CART_ID).orElseThrow();
        assertThat(updatedCart.getShippingDetail()).isNotNull();
        assertThat(updatedCart.getShippingDetail().getCost()).isEqualTo(5.00);
    }

    @Test
    void testSaveShippingDetail_ExistingDetail_FreeShippingApplied_Success() {
        // ARRANGE
        // Fetch a fresh, managed Cart entity
        Cart realCart = cartRepository.findById(TEST_CART_ID).orElseThrow();

        // 1. Setup the Discount: MUST set Discount ID and the bidirectional link.
        Discount freeShippingDiscount = new Discount();
        freeShippingDiscount.setDiscountId(UUID.randomUUID().toString());
        freeShippingDiscount.setCode("SHIPPING25");
        freeShippingDiscount.setCart(realCart); // CRITICAL FIX: Set the back-link to the Cart

        // 2. Setup existing Shipping Detail
        ShippingDetail existingDetail = new ShippingDetail();
        existingDetail.setAddress("Old Address");
        existingDetail.setCart(realCart); // CRITICAL FIX: Set the back-link to the Cart

        // Add entities to the Cart's collections/fields
        realCart.getDiscounts().add(freeShippingDiscount);
        realCart.setShippingDetail(existingDetail);

        // Persist the starting state *before* the service modifies it.
        // This ensures the ShippingDetail exists, resolving the Optimistic Lock issue.
        cartRepository.saveAndFlush(realCart);

        // 3. Stub the mocked CartService to return the tracked Cart object (freshly loaded by ID if needed)
        // Re-fetch to detach from the saveAndFlush call above to avoid optimistic locking confusion
        Cart serviceCart = cartRepository.findById(TEST_CART_ID).orElseThrow();
        when(cartService.getCartById(TEST_CART_ID)).thenReturn(Optional.of(serviceCart));

        // 4. Create the input ShippingDetail
        ShippingDetail inputDetail = new ShippingDetail();
        inputDetail.setBuyerFirstName("Jane");
        inputDetail.setAddress("456 New Road");

        // ACT
        ShippingDetail savedDetail = cartPricingService.saveShippingDetail(TEST_CART_ID, inputDetail);

        // ASSERT
        // 1. Check the returned ShippingDetail properties
        assertThat(savedDetail.getBuyerFirstName()).isEqualTo("Jane");
        assertThat(savedDetail.getAddress()).isEqualTo("456 New Road");
        assertThat(savedDetail.getCost()).isEqualTo(0.0); // Free shipping applied

        // 2. Verification via DB Fetch
        Cart updatedCart = cartRepository.findById(TEST_CART_ID).orElseThrow();
        assertThat(updatedCart.getShippingDetail().getCost()).isEqualTo(0.0);
        assertThat(updatedCart.getShippingDetail().getAddress()).isEqualTo("456 New Road");
    }

    @Test
    void testSaveShippingDetail_CartNotFound_ThrowsException() {
        final String NON_EXISTENT_ID = "nonExistentId";

        // ARRANGE: Stub the CartService to return empty Optional
        when(cartService.getCartById(any(String.class))).thenReturn(Optional.empty());

        ShippingDetail inputDetail = new ShippingDetail();
        inputDetail.setAddress("Anywhere");

        // ACT & ASSERT: AssertThrows should catch the IllegalStateException
        assertThrows(IllegalStateException.class, () -> {
            cartPricingService.saveShippingDetail(NON_EXISTENT_ID, inputDetail);
        });
    }

    @Test
    void testGetSummary_FullCalculation_Success() {
        // ARRANGE
        // 1. Start with a fresh cart instance
        Cart realCart = cartRepository.findById(TEST_CART_ID).orElseThrow();
        realCart.getCartItems().clear(); // Clear base cart items
        realCart.getDiscounts().clear();
        realCart.setShippingDetail(null); // Clean starting state

        // 2. Setup Cart Items
        CartItem item1 = createCartItem("p1", "v1");
        item1.setQuantity(2);
        item1.setPrice(100.0);
        item1.setDiscount(10.0);
        item1.setCart(realCart); // Establish bidirectional link

        CartItem item2 = createCartItem("p2", "v2");
        item2.setQuantity(1);
        item2.setPrice(50.0);
        item2.setDiscount(0.0);
        item2.setCart(realCart);

        // 3. Setup Discount (CRITICAL FIX: Manual ID assignment + backlink)
        Discount generalDiscount = new Discount();
        generalDiscount.setDiscountId(UUID.randomUUID().toString());
        generalDiscount.setCode("GENERAL10");
        generalDiscount.setValue(10.0);
        generalDiscount.setCart(realCart); // Establish bidirectional link
        realCart.getDiscounts().add(generalDiscount);

        // 4. Set Shipping Detail (CRITICAL FIX: Manual backlink)
        ShippingDetail detail = new ShippingDetail();
        detail.setAddress("Summary Address");
        detail.setCost(7.50);
        detail.setCart(realCart); // Establish bidirectional link
        realCart.setShippingDetail(detail);

        // 5. CRITICAL STEP: Persist the fully structured Cart to the DB for the service to find
        cartRepository.saveAndFlush(realCart);

        // 6. Stub the mocked CartService to return the persisted Cart object
        when(cartService.getCartById(TEST_CART_ID)).thenReturn(Optional.of(realCart));

        // ... Calculation remains the same ...

        // ACT
        Summary summary = cartPricingService.getSummary(TEST_CART_ID);

        // ASSERT
        assertThat(summary.getTotalItemCount()).isEqualTo(3);
        assertThat(summary.getSubtotalItems()).isEqualTo(250.0);
        assertThat(summary.getTotalDiscountAmount()).isEqualTo(30.0);
        assertThat(summary.getShippingCost()).isEqualTo(7.50);
        assertThat(summary.getTotalTaxAmount()).isEqualTo(45.50);
        assertThat(summary.getTotal()).isEqualTo(273.00);
        assertThat(summary.getCartItems()).hasSize(2);
    }

    @Test
    void testGetSummary_NoItems_ThrowsException() {
        // ARRANGE
        Cart realCart = cartRepository.findById(TEST_CART_ID).orElseThrow();

        // 1. Ensure NO ITEMS
        realCart.getCartItems().clear();

        // 2. Add a fully formed, persisted Shipping Detail (CRITICAL FIX)
        ShippingDetail detail = new ShippingDetail();
        detail.setAddress("Valid Address");
        detail.setCost(5.0);
        detail.setCart(realCart); // <-- Set the bidirectional link (PK derivation)
        realCart.setShippingDetail(detail);

        // 3. Persist the clean state (no items, but shipping detail exists)
        cartRepository.saveAndFlush(realCart);

        // 4. Stub the mocked CartService to return the PERSISTED Cart object
        // Re-fetch to ensure the service gets a clean, managed entity.
        Cart cartForService = cartRepository.findById(TEST_CART_ID).orElseThrow();
        when(cartService.getCartById(TEST_CART_ID)).thenReturn(Optional.of(cartForService));

        // ACT & ASSERT: The service should proceed past shipping check and fail on item check.
        assertThrows(IllegalStateException.class, () -> {
            cartPricingService.getSummary(TEST_CART_ID);
        }, "Should throw IllegalStateException when no items are in the cart.");
    }

    @Test
    void testGetSummary_NoShippingDetails_ThrowsException() {
        // ARRANGE
        // 1. Get the currently persisted Cart instance and ensure items are present but no shipping detail
        Optional<Cart> optionalCart = cartRepository.findById(TEST_CART_ID);
        assertTrue(optionalCart.isPresent());
        Cart realCart = optionalCart.get();

        // Add an item
        CartItem item = createCartItem("p1", "v1");
        item.setCart(realCart);

        realCart.setShippingDetail(null); // Ensure no shipping detail

        // 2. Stub the mocked CartService to return the tracked Cart object
        when(cartService.getCartById(TEST_CART_ID)).thenReturn(Optional.of(realCart));

        // ACT & ASSERT
        assertThrows(IllegalStateException.class, () -> {
            cartPricingService.getSummary(TEST_CART_ID);
        }, "Should throw IllegalStateException when shipping details are missing.");
    }

    @Test
    void testGetSummary_CartNotFound_ThrowsException() {
        final String NON_EXISTENT_ID = "nonExistentId";

        // ARRANGE: Stub the CartService to return empty Optional
        when(cartService.getCartById(any(String.class))).thenReturn(Optional.empty());

        // ACT & ASSERT: AssertThrows should catch the IllegalStateException
        assertThrows(IllegalStateException.class, () -> {
            cartPricingService.getSummary(NON_EXISTENT_ID);
        }, "Should throw IllegalStateException when cart is not found.");
    }
}