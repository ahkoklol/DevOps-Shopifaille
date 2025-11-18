package com.shopifaille.checkout.config;

import com.shopifaille.core.grpc.OrderManagementServiceGrpc;
import com.shopifaille.core.grpc.OrderManagementServiceGrpc.OrderManagementServiceBlockingStub;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.client.GrpcChannelFactory;

@Configuration
public class GrpcClientConfiguration {

    @Bean
    public OrderManagementServiceBlockingStub coreOrderManagementStub(GrpcChannelFactory channels) {

        return OrderManagementServiceGrpc.newBlockingStub(channels.createChannel("core"));
    }
}