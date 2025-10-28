package com.shopifaille.checkout;

import com.shopifaille.checkout.entity.Cart;
import com.shopifaille.checkout.entity.CartItem;
import com.shopifaille.checkout.repository.CartRepository;
import com.shopifaille.checkout.service.CartService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Transactional
public class CartServiceTest extends PostgresTestcontainer {

    @Autowired
    private CartService cartService;

    @Autowired
    private CartRepository cartRepository;

    private String testcartid = "testcartid";

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

    private CartItem createCartItem(String productId, String variantId) {
        CartItem item = new CartItem();
        item.setProductId(productId);
        item.setVariantId(variantId);
        item.setQuantity(1);
        item.setPrice(100.0);
        item.setDiscount(0.0);
        return item;
    }

    @BeforeEach
    void setup() {
        // cart1
        Cart baseCart1 = createBaseCart(testcartid, "teststoreid");
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
        Optional<Cart> cart = cartService.getCartById(testcartid);

        assertThat(cart).isPresent();
    }

    @Test
    void testAddItemToCart_NewItem_Success() {
        CartItem newItem = createCartItem("testproductid", "testvariantid");

        cartService.addItemToCart(testcartid, newItem);

        Optional<Cart> updatedCart = cartService.getCartById(testcartid);
        assertThat(updatedCart).isPresent();
        assertThat(updatedCart.get().getCartItems()).hasSize(1);

        CartItem savedItem = updatedCart.get().getCartItems().getFirst();
        assertThat(savedItem.getProductId()).isEqualTo("testproductid");
        assertThat(savedItem.getQuantity()).isEqualTo(1);
    }

    @Test
    void testAddItemToCart_ExistingItem_IncrementQuantity() {
        CartItem initialItem = createCartItem("testproductid", "testvariantid");
        cartService.addItemToCart(testcartid, initialItem);

        // check that adding an existing productid-variantid increments quantity by one
        CartItem incrementItem = createCartItem("testproductid", "testvariantid");
        cartService.addItemToCart(testcartid, incrementItem);

        Optional<Cart> updatedCart = cartService.getCartById(testcartid);
        assertThat(updatedCart).isPresent();
        assertThat(updatedCart.get().getCartItems()).hasSize(1); // only one CartItem

        CartItem savedItem = updatedCart.get().getCartItems().getFirst();
        assertThat(savedItem.getQuantity()).isEqualTo(2); // quantity = 2
    }

    @Test
    void testAddItemToCart_NotFound_ThrowsException() {
        CartItem item = createCartItem("testproductid", "testvariantid");

        assertThrows(IllegalStateException.class, () -> {
            cartService.addItemToCart("non-existent-id", item);
        });
    }

    @Test
    void testModifyQuantity_Update_Success() {
        CartItem updateItem = createCartItem("testproductid", "testvariantid");
        assertThat(updateItem.getQuantity()).isEqualTo(1);
        cartService.addItemToCart(testcartid, updateItem);

        cartService.modifyCartItemQuantity(testcartid, updateItem.getCartItemId(), 12);

        Optional<Cart> updatedCart = cartService.getCartById(testcartid);
        assertThat(updatedCart).isPresent();

        CartItem savedItem = updatedCart.get().getCartItems().getFirst();
        assertThat(savedItem.getQuantity()).isEqualTo(12);
    }

    @Test
    void testModifyQuantity_Idempotence_NoChange() {
        CartItem updateItem = createCartItem("testproductid", "testvariantid");
        updateItem.setQuantity(5);
        cartService.addItemToCart(testcartid, updateItem);

        // check update if quantity is the same
        cartService.modifyCartItemQuantity(testcartid, updateItem.getCartItemId(), 5);
        Optional<Cart> updatedCart = cartService.getCartById(testcartid);
        assertThat(updatedCart).isPresent();
        assertThat(updatedCart.get().getCartItems()).hasSize(1);
        assertThat(updatedCart.get().getCartItems().getFirst().getQuantity()).isEqualTo(5);
    }

    @Test
    void testModifyQuantity_ItemNotFound_ThrowsException() {
        CartItem nonExistentItem = createCartItem("fakeproductid", "fakevariantid");

        assertThrows(IllegalStateException.class, () -> {
            cartService.modifyCartItemQuantity(testcartid, nonExistentItem.getCartItemId(), 5);
        });
    }

    @Test
    void testModifyQuantity_InvalidQuantity_ThrowsException() {
        CartItem invalidItem = createCartItem("testproductid", "testvariantid");

        assertThrows(IllegalArgumentException.class, () -> {
            cartService.modifyCartItemQuantity(testcartid, invalidItem.getCartItemId(), 0);
        });
    }

    @Test
    void testRemoveItemFromCart_Success() {
        CartItem item = createCartItem("testproductid", "testvariantid");
        cartService.addItemToCart(testcartid, item);

        cartService.removeItemFromCart(testcartid, item.getCartItemId());

        Optional<Cart> updatedCart = cartService.getCartById(testcartid);
        assertThat(updatedCart).isPresent();
        assertThat(updatedCart.get().getCartItems()).isEmpty();
    }

    @Test
    void testRemoveItemFromCart_CartNotFound_ThrowsException() {
        assertThrows(IllegalStateException.class, () -> {
            cartService.removeItemFromCart("fakecartid", "fakecartitemid");
        });
    }

    @Test
    void testRemoveItemFromCart_ItemNotFound_ThrowsException() {
        assertThrows(IllegalStateException.class, () -> {
            cartService.removeItemFromCart(testcartid, "fakecartitemid");
        });
    }
}
