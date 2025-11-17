package com.shopifaille.checkout.repository;

import com.shopifaille.checkout.entity.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountRepository extends JpaRepository<Discount,String> {
}
