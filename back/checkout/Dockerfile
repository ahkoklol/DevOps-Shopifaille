# Stage 1: Build the Spring Boot application using a dedicated Maven image
# FIX: Using 'maven:3.9-eclipse-temurin-21-alpine' ensures the 'mvn' command is available.
FROM maven:3.9-eclipse-temurin-21-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# --- FIX: Install protoc compiler and glibc compatibility for gRPC plugin ---
# 1. 'protobuf': Provides the musl-compatible Protobuf compiler (protoc).
# 2. 'libc6-compat': Provides glibc libraries needed to run the gRPC plugin binary (protoc-gen-grpc-java) 
#    which Maven downloads but is compiled for glibc environments.
RUN apk update && \
    apk add protobuf libc6-compat
# --------------------------------------------------------------------------

# Copy the Maven project files
COPY pom.xml .
COPY src ./src

# Build the Spring Boot executable JAR file
# '-DskipTests' is often used to speed up container image creation.
RUN mvn clean package -DskipTests

# ---
# Stage 2: Create the final, lean runtime image
FROM eclipse-temurin:21-jre-alpine

# Expose the port your Spring Boot app runs on (default 8080)
EXPOSE 8080

# Set the working directory
WORKDIR /app

# Copy the built JAR from the 'build' stage.
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]