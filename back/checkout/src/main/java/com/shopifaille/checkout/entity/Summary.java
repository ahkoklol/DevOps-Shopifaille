package com.shopifaille.checkout.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Entity
@Table(name = "summary")
public class Summary {

    @Id
    @Column(name = "summary_id")
    private String summaryId;

    private String cartId;

    @Column(name = "total_item_count")
    private Integer totalItemCount;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Transient
    private List<CartItem> cartItems = new ArrayList<>();

    private Double subtotalItems;
    private Double totalDiscountAmount;
    private Double shippingCost;
    private Double totalTaxAmount;
    private Double total;
    private Date date;
}
