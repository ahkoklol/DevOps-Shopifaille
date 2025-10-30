package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/gorilla/mux"
	"github.com/ahkoklol/DevOps-Shopify/back/products/internal/api/rest"
	"github.com/ahkoklol/DevOps-Shopify/back/products/internal/product"
	"github.com/ahkoklol/DevOps-Shopify/back/products/internal/repository" 
)

// main initializes the PostgreSQL connection, the business service, the REST handlers, and starts the server.
func main() {
    // 0. Load .env file
    if err := godotenv.Load(); err != nil {
        // This is fine for prod where env vars are set directly, but log a warning for local dev.
        log.Println("Warning: Could not load .env file. Proceeding with existing environment variables.")
    }
    
    // --- 1. Load Configuration ---
    
    // 1a. DATABASE_URL (Mandatory, no fallback)
    dbURL := os.Getenv("DATABASE_URL")
    if dbURL == "" {
        log.Fatal("FATAL: Environment variable DATABASE_URL is not set. Cannot connect to DB.")
    }
    
    // 1b. APP_PORT (Optional, use 8080 as fallback)
    portStr := os.Getenv("APP_PORT")
    port := 8080 // Default port
    if portStr != "" {
        p, err := strconv.Atoi(portStr)
        if err != nil {
            log.Printf("Warning: Invalid APP_PORT value '%s'. Using default port %d.", portStr, port)
        } else {
            port = p
        }
    }

	// 2. Initialize Database Connection Pool (Adapter Dependency)
	dbPool, err := pgxpool.New(context.Background(), dbURL)
	// ... (le reste de l'initialisation de la DB est correct)
    
    if err != nil {
        log.Fatalf("Unable to create connection pool: %v\n", err)
    }
    defer dbPool.Close()

    // Ping the database to ensure connection is valid
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := dbPool.Ping(ctx); err != nil {
        log.Fatalf("DB connection failed after ping: %v\n", err)
    }
    log.Println("Successfully connected to PostgreSQL!")

	// 3. Assemble the Core (Dependency Injection)
	repo, err := repository.NewPostgresRepository(dbPool)
	if err != nil {
		log.Fatalf("Failed to create repository: %v", err)
	}

	productService := product.NewService(repo)
	handler := rest.NewHandler(productService)
    
	// 4. Setup Router and Routes
	router := mux.NewRouter()

	// REST Endpoints (Store Gateway / Merchant UI)
    // NOTE: If you decide to drop Mux for a simpler standard net/http router (recommended if you don't need complex routing)
    // you would replace the mux-specific functions here.
    
    // Example with Mux for GET /products/{id} and injecting "id" into the context for handler.go to read:
    // router.HandleFunc("/products/{id}", injectMuxVars(handler.GetProductByID, "id")).Methods("GET")
    
    // For now, let's keep the existing logic and add the necessary routes for functional testing:

    // Routes requiring ID extraction (Use Mux.HandleFunc for path variables)
    router.HandleFunc("/products/{id}", handler.GetProductByID).Methods("GET")
    router.HandleFunc("/products/{id}", handler.UpdateProduct).Methods("PUT")
    router.HandleFunc("/products/{id}", handler.DeleteProduct).Methods("DELETE")
    router.HandleFunc("/products/{id}/stock", handler.GetStockLevelHandler).Methods("GET")

    // Routes for lists/creation
    router.HandleFunc("/products", handler.GetProducts).Methods("GET")
    router.HandleFunc("/products", handler.CreateProduct).Methods("POST")

	// Routes for categories
    router.HandleFunc("/categories", handler.CreateCategoryHandler).Methods("POST")
	router.HandleFunc("/categories", handler.GetCategoriesHandler).Methods("GET")
    categoryRouter := router.PathPrefix("/categories").Subrouter()
    categoryRouter.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
        vars := mux.Vars(r)
        id := vars["id"]
        
        // Inject the path variable into the request context with the key expected by the handler
        ctx := context.WithValue(r.Context(), "category_id", id)
        
        handler.DeleteCategoryHandler(w, r.WithContext(ctx))
    }).Methods("DELETE")

    // Routes for media
    router.HandleFunc("/products/{productID}/media", func(w http.ResponseWriter, r *http.Request) {
        productID := mux.Vars(r)["productID"]
        ctx := context.WithValue(r.Context(), "product_id", productID)
        handler.GetMediaForProduct(w, r.WithContext(ctx))
    }).Methods("GET")

    // POST /products/{productID}/media: Add a new media item to a product
    router.HandleFunc("/products/{productID}/media", func(w http.ResponseWriter, r *http.Request) {
        productID := mux.Vars(r)["productID"]
        ctx := context.WithValue(r.Context(), "product_id", productID)
        handler.AddMediaToProduct(w, r.WithContext(ctx))
    }).Methods("POST")

    // DELETE /products/{productID}/media/{mediaID}: Delete a specific media item
    router.HandleFunc("/products/{productID}/media/{mediaID}", func(w http.ResponseWriter, r *http.Request) {
        mediaID := mux.Vars(r)["mediaID"] 
        ctx := context.WithValue(r.Context(), "media_id", mediaID)
        handler.DeleteMediaByID(w, r.WithContext(ctx))
    }).Methods("DELETE")
    
    // Root endpoint
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, DevOps-Shopifaille! Products microservice is active.")
	})

	// 5. Start the Server (Uses the dynamically loaded port)
	addr := fmt.Sprintf(":%d", port)
	log.Printf("Server starting on http://localhost%s", addr)

	// Start the HTTP server with the configured router
	log.Fatal(http.ListenAndServe(addr, router))
}