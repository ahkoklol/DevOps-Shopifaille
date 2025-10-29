package com.shopifaille.checkout.client;

import com.shopifaille.core.grpc.CheckDiscountRequest;
import com.shopifaille.core.grpc.CheckDiscountResponse;
import com.shopifaille.core.grpc.OrderManagementServiceGrpc.OrderManagementServiceBlockingStub;
import com.shopifaille.core.grpc.PlaceOrderRequest;
import com.shopifaille.core.grpc.PlaceOrderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CoreGateway {

    private OrderManagementServiceBlockingStub coreClientStub;

    @Autowired
    public CoreGateway(OrderManagementServiceBlockingStub coreOrderManagementStub) {
        this.coreClientStub = coreOrderManagementStub;
    }

    public CheckDiscountResponse validateDiscountCode(CheckDiscountRequest checkDiscountRequest) {

        CheckDiscountRequest request = CheckDiscountRequest.newBuilder()
                .setCode(checkDiscountRequest.getCode())
                .build();

        return coreClientStub.checkDiscount(request);
    }

    public PlaceOrderResponse placeOrder(PlaceOrderRequest placeOrderRequest) {

        PlaceOrderRequest request = PlaceOrderRequest.newBuilder()
                .setStoreId(placeOrderRequest.getStoreId())
                .setShippingAddress(placeOrderRequest.getShippingAddress())
                .setBillingAddress(placeOrderRequest.getBillingAddress())
                .setTotal(placeOrderRequest.getTotal())
                .setTaxes(placeOrderRequest.getTaxes())
                .setShipping(placeOrderRequest.getShipping())
                .setStatus(placeOrderRequest.getStatus())
                .setTransactionId(placeOrderRequest.getTransactionId())
                .setDate(placeOrderRequest.getDate())
                .build();

        return  coreClientStub.placeOrder(request);
    }

}