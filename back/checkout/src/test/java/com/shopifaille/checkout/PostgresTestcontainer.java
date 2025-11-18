package com.shopifaille.checkout;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
public class PostgresTestcontainer {
    // Define the container as a static field
    // The static modifier ensures the container is started only once for all tests in the same test suite.
    @Container
    public static PostgreSQLContainer<?> postgresContainer = new PostgreSQLContainer<>("postgres:latest")
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpass");

    // DynamicPropertySource updates Spring's configuration
    @DynamicPropertySource
    static void setDatasourceProperties(DynamicPropertyRegistry registry) {
        // These properties override what's in application.properties/yml
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
        // Important for table creation if you rely on JPA DDL generation
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }
}
