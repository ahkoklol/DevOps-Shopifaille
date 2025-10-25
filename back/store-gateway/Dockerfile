# Stage 1: Build the Spring Boot application using a dedicated Maven image
# This image includes Maven, JDK 21, and Alpine Linux for the build environment.
FROM maven:3.9-eclipse-temurin-21-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project files
# Assumes pom.xml is in the back/store-gateway directory
COPY pom.xml .
COPY src ./src

# Build the Spring Boot executable JAR file
RUN mvn clean package -DskipTests

# ---
# Stage 2: Create the final, lean runtime image
FROM eclipse-temurin:21-jre-alpine

# Expose the port your Spring Boot app runs on (default 8080)
EXPOSE 8080

# Set the working directory
WORKDIR /app

# Copy the built JAR from the 'build' stage
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]