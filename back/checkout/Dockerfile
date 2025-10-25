# Stage 1: Build the Spring Boot application using the official Temurin JDK image
FROM eclipse-temurin:21-jdk-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project files
# The Maven wrapper (mvnw) is often included, along with the main project definition
COPY pom.xml .
# If you use the maven wrapper, copy it and the .mvn directory too.
# COPY mvnw .
# COPY .mvn .

# Copy source code. This assumes the project structure is flat inside /app 
# and the pom.xml references 'src/main/...'
COPY src ./src

# Build the Spring Boot executable JAR file
# 'package' runs tests and compiles, 'install' installs to local repo (not needed here)
# The resulting JAR will be in target/
RUN mvn clean package -DskipTests

# ---
# Stage 2: Create the final, lean runtime image
FROM eclipse-temurin:21-jre-alpine

# Expose the port your Spring Boot app runs on (default 8080)
EXPOSE 8080

# Set the working directory
WORKDIR /app

# Copy the built JAR from the 'build' stage. 
# The name pattern is typically [artifact-id]-[version].jar
# We use the generic *.jar pattern and assume only one JAR is produced.
COPY --from=build /app/target/*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]