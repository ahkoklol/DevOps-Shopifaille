package repository_test

import (
	"context"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
	. "github.com/ahkoklol/DevOps-Shopify/back/products/internal/repository"
	"github.com/ahkoklol/DevOps-Shopify/back/products/internal/product"
)

// setupTestDB creates a temporary Postgres container for testing
func setupTestDB(ctx context.Context, t *testing.T) *pgxpool.Pool {
	t.Helper()

    // 1. Determine the absolute path of init.sql dynamically
    _, filename, _, _ := runtime.Caller(0)
    // Path: /path/to/back/products/internal/repository/postgres_test.go
    
    // Go up two levels (repository -> internal -> products) and append init.sql
    initScriptPath := filepath.Join(filepath.Dir(filename), "..", "..", "init.sql")
    
    // Safety check: ensure the file exists before attempting to mount it
    if _, err := os.Stat(initScriptPath); os.IsNotExist(err) {
        t.Fatalf("CRITICAL: init.sql not found at calculated path: %s. Error: %v", initScriptPath, err)
    }

	// Use a specific image version for stability
	pgContainer, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("postgres:16-alpine"),
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("user"),
		postgres.WithPassword("pass"),
		// Wait for PostgreSQL to be ready on port 5432
		testcontainers.WithWaitStrategy(wait.ForLog("database system is ready to accept connections").WithOccurrence(2)),
		
		// 2. FIX: Use the calculated absolute path
		postgres.WithInitScripts(initScriptPath), 
	)
	if err != nil {
		t.Fatalf("Failed to start postgres container: %v", err)
	}
    
    // ... (rest of the function remains the same: connStr logic, t.Cleanup, dbPool creation)
    
	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("Failed to get connection string: %v", err)
	}
	
	// Defer termination of the container
	t.Cleanup(func() {
		if err := pgContainer.Terminate(ctx); err != nil {
			t.Logf("Warning: failed to terminate container: %v", err)
		}
	})

	dbPool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		t.Fatalf("Unable to connect to test database: %v", err)
	}

	return dbPool
}

func TestPostgresRepository_CreateAndFind(t *testing.T) {
	ctx := context.Background()
    // NOTE: This setup relies on docker being available to run the testcontainer.
	dbPool := setupTestDB(ctx, t)
    
    // FIX: Must capture two return values (repo, err)
	repo, err := NewPostgresRepository(dbPool)
    if err != nil {
        t.Fatalf("Failed to initialize repository: %v", err)
    }

    // Helper to ensure the foreign key dependency is met
    createTestCategory := func(t *testing.T) string {
        catID := uuid.New().String()
        cat := &product.Category{CategoryId: catID, Name: "Test Category"}
        
        // Use the actual repository method to insert the dependency
        err := repo.CreateCategory(ctx, cat)
        if err != nil {
            t.Fatalf("Failed to create prerequisite category: %v", err)
        }
        return catID
    }
    
    // CRITICAL: Create the category first
    validCategoryID := createTestCategory(t)

	// 1. Setup Data with valid CategoryID
	newProduct := &product.Product{
		ProductId: 	 uuid.New().String(),
		Title: 	 	 "Test Product",
		Description: "Repo Test Product",
		Slug: 	 	 "test-product-unique", // Ensure unique slug for the test suite
		StoreId: 	 "S1",
		CategoryId:  validCategoryID, // Link to the created category
		Variants: []product.Variant{
			{VariantId: uuid.New().String(), Sku: "SKU1", Price: 10.0, Currency: "USD", Quantity: 5, Attributes: []byte(`{"color":"blue"}`)},
		},
	}
	
    // --- Test Cases ---
    
	t.Run("Create_Success", func(t *testing.T) {
		err := repo.Create(ctx, newProduct)
		assert.NoError(t, err)
	})

	t.Run("FindByID_Success_Hydrated", func(t *testing.T) {
		foundProduct, err := repo.FindByID(ctx, newProduct.ProductId)
		assert.NoError(t, err)
		assert.NotNil(t, foundProduct)
		assert.Equal(t, newProduct.Title, foundProduct.Title)
		assert.Greater(t, len(foundProduct.Variants), 0, "Variants should be hydrated")
        assert.Equal(t, newProduct.Variants[0].Sku, foundProduct.Variants[0].Sku)
	})

	t.Run("FindByID_NotFound", func(t *testing.T) {
		foundProduct, err := repo.FindByID(ctx, uuid.New().String())
		assert.ErrorIs(t, err, product.ErrNotFound)
		assert.Nil(t, foundProduct)
	})
	
	t.Run("Create_Conflict_Slug", func(t *testing.T) {
        // Attempt to create a new product with the SAME SLUG ("test-product-unique")
        p2 := &product.Product{
            ProductId: 	 uuid.New().String(),
            Title: 	 	 "Another Product",
            Description: "Duplicate Slug Test",
            Slug: 	 	 newProduct.Slug, // Intentional duplicate
            StoreId: 	 "S2",
            CategoryId:  validCategoryID,
        }
		err := repo.Create(ctx, p2) 
        // Expect mapPostgreError to return a conflict error
		assert.ErrorIs(t, err, product.ErrConflict)
	})
}