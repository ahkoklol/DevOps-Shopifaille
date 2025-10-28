package com.shopifaille.checkout.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @Column(name = "cart_id")
    private String cartId;

    @Column(name = "store_id")
    private String storeId;

    private String status;

    @ToString.Exclude
    @OneToMany(
            mappedBy = "cart",
            cascade = CascadeType.ALL, // propagate save and delete
            orphanRemoval = true // remove items if removed from the list
    )
    private List<CartItem> cartItems = new ArrayList<>();

    @ToString.Exclude
    @OneToMany(
            mappedBy = "cart",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Discount> discounts = new ArrayList<>();

    @Column(name = "date_created")
    private Date dateCreated;

    @Column(name = "date_modified")
    private Date dateModified;
}
