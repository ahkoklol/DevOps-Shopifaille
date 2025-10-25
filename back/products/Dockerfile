# Stage 1: Build the Go binary
# Use the official Go image with the version specified in your ci workflow (1.25.3)
FROM golang:1.25.3-alpine AS builder

# Set the working directory
WORKDIR /app

# Enable CGO and set GOOS for static linking and compilation for Alpine Linux
ENV CGO_ENABLED=0 GOOS=linux

# Copy go.mod and go.sum files to take advantage of Docker caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy all source files
COPY . .

# Build the application
# Output the static executable binary (e.g., "products-api")
RUN go build -o products-api ./cmd/main.go 


# ---
# Stage 2: Create the final, lean runtime image
# Use the smallest possible image to run the static binary
FROM alpine:latest

# Expose the port your Go app runs on (standard Go/API port)
EXPOSE 8080 

# Set the working directory
WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /app/products-api .

# Set the entry point to run the application
CMD ["./products-api"]