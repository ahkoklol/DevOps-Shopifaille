package com.shopifaille.checkout.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.Date;

@Data
@Entity
@Table(name = "discount")
public class Discount {

    @Id
    @Column(name = "discount_id")
    private String discountId;

    private String code;
    private String type;
    private double value;
    private boolean active = true;

    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @Column(name = "start_date")
    private Date startDate;

    @Column(name = "end_date")
    private Date endDate;
}
