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

type contextKey int

const (
    // contextKeyProductID is the context key for the Product ID path variable.
    contextKeyProductID contextKey = iota
    // contextKeyCategoryID is the context key for the Category ID path variable.
    contextKeyCategoryID
    // contextKeyMediaID is the context key for the Media ID path variable.
    contextKeyMediaID
)

// MuxVarsInjector takes a handler and a list of path variable names (Mux expects these) 
// and injects them into the request context with the standard key names used by the rest.Handler.
func MuxVarsInjector(next http.HandlerFunc, keyMap map[string]string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		ctx := r.Context()

		// Inject each required path variable into the context
		for muxKey, handlerKey := range keyMap {
			if val, ok := vars[muxKey]; ok {
				// We use the string expected by the rest.Handler for simplicity, 
				// though best practice is to use the custom contextKey type.
				ctx = context.WithValue(ctx, handlerKey, val) 
			}
		}

		// Call the next handler in the chain
		next(w, r.WithContext(ctx))
	}
}

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
    router.HandleFunc("/products/{product_id}", 
        MuxVarsInjector(handler.GetProductByID, map[string]string{"product_id": "product_id"}),
    ).Methods("GET")
    
    router.HandleFunc("/products/{product_id}", 
        MuxVarsInjector(handler.UpdateProduct, map[string]string{"product_id": "product_id"}),
    ).Methods("PUT")
    
    router.HandleFunc("/products/{product_id}", 
        MuxVarsInjector(handler.DeleteProduct, map[string]string{"product_id": "product_id"}),
    ).Methods("DELETE")
    
    router.HandleFunc("/products/{product_id}/stock", 
        MuxVarsInjector(handler.GetStockLevelHandler, map[string]string{"product_id": "product_id"}),
    ).Methods("GET")

    // Routes for lists/creation
    router.HandleFunc("/products", handler.GetProducts).Methods("GET")
    router.HandleFunc("/products", handler.CreateProduct).Methods("POST")

	// Routes for categories
    router.HandleFunc("/categories", handler.CreateCategoryHandler).Methods("POST")
	router.HandleFunc("/categories", handler.GetCategoriesHandler).Methods("GET")
    router.HandleFunc("/categories/{category_id}", 
        MuxVarsInjector(handler.DeleteCategoryHandler, map[string]string{"category_id": "category_id"}),
    ).Methods("DELETE")

    // Routes for media
    router.HandleFunc("/products/{product_id}/media", 
        MuxVarsInjector(handler.GetMediaForProduct, map[string]string{"product_id": "product_id"}),
    ).Methods("GET")

    // POST /products/{product_id}/media: Refactored to use MuxVarsInjector
    router.HandleFunc("/products/{product_id}/media", 
        MuxVarsInjector(handler.AddMediaToProduct, map[string]string{"product_id": "product_id"}),
    ).Methods("POST")

    // DELETE /products/{product_id}/media/{media_id}: Refactored to use MuxVarsInjector
    router.HandleFunc("/products/{product_id}/media/{media_id}", 
        MuxVarsInjector(handler.DeleteMediaByID, map[string]string{"media_id": "media_id"}),
    ).Methods("DELETE")

	// 5. Start the Server (Uses the dynamically loaded port)
	addr := fmt.Sprintf(":%d", port)
	log.Printf("Server starting on http://localhost%s", addr)

	// Start the HTTP server with the configured router
	log.Fatal(http.ListenAndServe(addr, router))
}