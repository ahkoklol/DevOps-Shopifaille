package com.shopifaille.checkout.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.UUID;

@Data
@Entity
@Table(name = "cartitem")
public class CartItem {

    @Id
    @Column(name = "cart_item_id")
    private String cartItemId = UUID.randomUUID().toString();

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false) // Définit la colonne de clé étrangère
    private Cart cart;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "variant_id")
    private String variantId;

    private int quantity;
    private double price;
    private double discount;

    // method to establish bidirectional relationship between Cart and CartItem
    public void setCart(Cart cart) {
        this.cart = cart;
        if (!cart.getCartItems().contains(this)) {
            cart.getCartItems().add(this);
        }
    }
}
