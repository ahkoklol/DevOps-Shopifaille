package com.shopifaille.checkout.entity;

import jakarta.persistence.*;
import lombok.Data;

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

    @OneToMany(
            mappedBy = "cart", // 'cart' est le nom du champ ManyToOne dans l'entité CartItem
            cascade = CascadeType.ALL, // Les opérations de persistance (save, delete) se propagent aux items
            orphanRemoval = true // Supprime les items si retirés de la liste
    )
    private List<CartItem> cartItems = new ArrayList<>();

    @Column(name = "date_created")
    private Date dateCreated;

    @Column(name = "date_modified")
    private Date dateModified;
}
