package com.shopifaille.checkout.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.Date;

@Data
@Entity
@Table(name = "shipping_detail")
public class ShippingDetail {

    @Id
    @Column(name = "cart_id")
    private String cartId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "cart_id")
    @ToString.Exclude
    private Cart cart;

    @Column(name = "buyer_first_name")
    private String buyerFirstName;

    @Column(name = "buyer_last_name")
    private String buyerLastName;

    @Column(name = "buyer_email")
    private String buyerEmail;

    @Column(name = "address")
    private String address;

    @Column(name = "cost")
    private Double cost;

    private Date date;
}