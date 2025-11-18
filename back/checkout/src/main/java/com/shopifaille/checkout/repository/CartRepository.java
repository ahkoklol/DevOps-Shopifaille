package com.shopifaille.checkout.repository;

import com.shopifaille.checkout.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, String> {
}
