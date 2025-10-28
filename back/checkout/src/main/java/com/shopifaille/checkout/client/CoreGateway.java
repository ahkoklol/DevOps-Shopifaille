package com.shopifaille.checkout.client;

import com.shopifaille.core.grpc.CheckDiscountRequest;
import com.shopifaille.core.grpc.CheckDiscountResponse;
import com.shopifaille.core.grpc.OrderManagementServiceGrpc.OrderManagementServiceBlockingStub;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CoreGateway {

    private OrderManagementServiceBlockingStub coreClientStub;

    @Autowired
    public CoreGateway(OrderManagementServiceBlockingStub coreOrderManagementStub) {
        this.coreClientStub = coreOrderManagementStub;
    }

    public CheckDiscountResponse validateDiscountCode(String code) {

        CheckDiscountRequest request = CheckDiscountRequest.newBuilder()
                .setCode(code)
                .build();

        return coreClientStub.checkDiscount(request);
    }
}