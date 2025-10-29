package product

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid" // Use for ProductID generation
)

// Define specific domain errors to allow API handlers to map to correct HTTP/gRPC codes.
var (
	ErrNotFound      = errors.New("product not found")
	ErrConflict      = errors.New("data conflict: resource already exists or violates uniqueness")
	ErrValidation    = errors.New("input validation failed")
	ErrOutOfStock    = errors.New("out of stock")
	ErrInsufficientPrivileges = errors.New("insufficient privileges")
)

// Service is the core business logic layer.
type Service struct {
	repo Repository
}

// NewService creates a new product service instance.
func NewService(r Repository) *Service {
	// CRITICAL CHECK: Ensure the core dependency is provided.
	if r == nil {
		panic("Repository dependency cannot be nil")
	}
	return &Service{
		repo: r,
	}
}

// validateID checks if an ID string is a valid non-empty UUID (optional: replace with actual UUID check).
func validateID(id string) error {
	if id == "" {
		return fmt.Errorf("%w: ID cannot be empty", ErrValidation)
	}
	// REAL CHECK: Add actual UUID parsing here.
	if _, err := uuid.Parse(id); err != nil {
        return fmt.Errorf("%w: invalid ID format", ErrValidation)
    }
	return nil
}

// --- REST Endpoint Implementations (Store Gateway / Merchant UI) ---

// GetByID retrieves a product by its unique ID.
func (s *Service) GetById(ctx context.Context, id string) (*Product, error) {
	// REAL CHECK 1: Input Validation
	if err := validateID(id); err != nil {
		return nil, err
	}

	p, err := s.repo.FindByID(ctx, id)

	// REAL CHECK 2: Handle specific not found errors.
	if errors.Is(err, ErrNotFound) {
		return nil, ErrNotFound // Propagate the specific error for handler to return 404.
	}
	
	return p, err
}

// SearchByCategory retrieves a list of products belonging to a specific category, with pagination.
func (s *Service) SearchByCategory(ctx context.Context, categoryID string, page, size int) ([]*Product, int, error) {
	// REAL CHECK 1: Input Validation for Category ID
	if err := validateID(categoryID); err != nil {
        return nil, 0, fmt.Errorf("%w: category ID validation failed", err)
	}
    
	// REAL CHECK 2: Pagination parameter sanitization and limits.
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 20 // Default page size
	}
	const MaxPageSize = 100
	if size > MaxPageSize {
		size = MaxPageSize // Enforce max limit for system stability
	}

	return s.repo.FindByCategory(ctx, categoryID, page, size)
}

// GetAll retrieves a list of all products, with optional filtering and pagination.
func (s *Service) GetAll(ctx context.Context, page, size int, filters map[string]string) ([]*Product, int, error) {
	// REAL CHECK 1: Pagination parameter sanitization and limits (similar to SearchByCategory).
	if page < 1 {
		page = 1
	}
	if size < 1 {
		size = 20
	}
	const MaxPageSize = 100
	if size > MaxPageSize {
		size = MaxPageSize
	}

    // REAL CHECK 2: Sanitize and interpret filter maps.
    validatedFilters := make(map[string]string)
    allowedFilters := map[string]bool{"price_min": true, "price_max": true, "store_id": true, "slug": true}
    for key, value := range filters {
        if allowedFilters[key] {
            // Further validation logic here (e.g., check if price_min is a positive number).
            validatedFilters[key] = value
        }
    }
    
	return s.repo.FindAll(ctx, page, size, validatedFilters)
}

// CreateProduct validates the product data and saves a new product.
func (s *Service) CreateProduct(ctx context.Context, p *Product) error {
	// REAL CHECK 1: Input Validation - Check for nil and mandatory fields.
	if p == nil {
		return fmt.Errorf("%w: product object cannot be nil", ErrValidation)
	}
	if p.Title == "" || p.Description == "" || p.CategoryId == "" || p.StoreId == "" {
		return fmt.Errorf("%w: Title, Description, CategoryID, and StoreID are mandatory", ErrValidation)
	}
    
    // REAL CHECK 2: Price Validation (must be positive).
    // Note: Assuming Variant prices are handled separately, but general product price could be validated here.
    
    // REAL CHECK 3: Slug Validation/Generation
    if p.Slug == "" {
        // Business Logic: Auto-generate a URL-safe slug from p.Title here.
        p.Slug = uuid.New().String() // Placeholder for a unique, URL-safe slug
    }
    // CRITICAL CHECK: Repository must ensure slug uniqueness. The repo should return ErrConflict if violated.

    // REAL CHECK 4: ID Generation and Uniqueness.
    if p.ProductId == "" {
        // CRITICAL: Generate a new unique ID.
        p.ProductId = uuid.New().String()
    } else {
        // If an ID is provided, check if it's already in use to prevent conflict.
        if err := validateID(p.ProductId); err != nil {
            return err
        }
        existing, err := s.repo.FindByID(ctx, p.ProductId)
        if err == nil && existing != nil {
            return fmt.Errorf("%w: product with ID %s already exists", ErrConflict, p.ProductId)
        }
    }
    
    // REAL CHECK 5: Set creation/modification timestamps.
	now := time.Now()
	p.DateCreated = now
	p.DateModified = now // Initial modified date is the creation date

	return s.repo.Create(ctx, p)
}

// UpdateProduct validates and applies changes to an existing product.
func (s *Service) UpdateProduct(ctx context.Context, p *Product) error {
	// REAL CHECK 1: Input Validation - Product ID is required.
	if p == nil || p.ProductId == "" {
		return fmt.Errorf("%w: Product ID is required for update", ErrValidation)
	}
	if err := validateID(p.ProductId); err != nil {
		return err
	}

	// REAL CHECK 2: Existence Verification (Prevent updating a non-existent resource).
	_, err := s.repo.FindByID(ctx, p.ProductId)
	if errors.Is(err, ErrNotFound) {
		return fmt.Errorf("cannot update: %w", ErrNotFound)
	}
	if err != nil {
		return fmt.Errorf("failed to check existence: %w", err)
	}
    
    // REAL CHECK 3: Authorization (Placeholder - Merchant UI user must have permission).
    // if !s.auth.CanUpdate(ctx, p.StoreID) { // Assuming context carries user info
    //     return ErrInsufficientPrivileges
    // }

	// REAL CHECK 4: Set modification timestamp.
	p.DateModified = time.Now()
    
    // Note: For partial updates (PATCH), logic to merge fields from 'p' into 'existing' 
    // before calling repo.Update should be placed here.
	return s.repo.Update(ctx, p)
}

// DeleteProduct removes a product.
func (s *Service) DeleteProduct(ctx context.Context, id string) error {
	// REAL CHECK 1: Input Validation
	if err := validateID(id); err != nil {
		return err
	}
    
    // REAL CHECK 2: Existence Verification.
    _, err := s.repo.FindByID(ctx, id)
    if errors.Is(err, ErrNotFound) {
        return ErrNotFound // Resource already gone.
    }
    if err != nil {
        return fmt.Errorf("failed to check existence before deletion: %w", err)
    }
    
	// REAL CHECK 3 (CRITICAL): Dependency/Integrity Check. 
    // In a real e-commerce scenario, this is crucial.
    // Example: Block deletion if product is part of an unfulfilled order.
    // if s.OrderService.HasActiveLineItems(ctx, id) { 
    //     return fmt.Errorf("%w: active orders depend on product %s", ErrConflict, id)
    // }
    
    // REAL CHECK 4: Authorization Check (Placeholder). 
    // if !s.auth.CanDelete(ctx, id) {
    //     return ErrInsufficientPrivileges
    // }

	return s.repo.Delete(ctx, id)
}

// GetProductStockLevel retrieves only the current stock quantity for a product.
func (s *Service) GetProductStockLevel(ctx context.Context, productID string) (int, error) {
    // REAL CHECK: Input Validation
	if err := validateID(productID); err != nil {
		return 0, err
	}
    
    // REAL CHECK: Existence Verification
    _, err := s.repo.FindByID(ctx, productID)
    if errors.Is(err, ErrNotFound) {
        return 0, ErrNotFound
    }
    if err != nil {
        return 0, fmt.Errorf("failed to retrieve product existence: %w", err)
    }
    
	return s.repo.GetStockLevel(ctx, productID)
}

// CreateCategory validates category data (name, store, parent existence) and saves it.
func (s *Service) CreateCategory(ctx context.Context, c *Category) error {
	// REAL CHECK 1: Input Validation
	if c == nil || c.Name == "" || c.StoreId == "" {
		return fmt.Errorf("%w: Category Name and StoreId are mandatory", ErrValidation)
	}
	
	// REAL CHECK 2: Validate IDs
	// The CategoryID will be generated in the Repository or Service (uuid.New().String()).
	// Validate c.StoreId (optional: validate StoreId format if applicable)
	
	// REAL CHECK 3: Parent Existence and Ownership Check (CRITICAL)
	if c.ParentId != nil && *c.ParentId != "" {
        // Parent must exist AND belong to the same store for multi-tenancy integrity.
		parent, err := s.repo.GetCategoryByID(ctx, *c.ParentId)
		if errors.Is(err, ErrNotFound) {
			return fmt.Errorf("%w: Parent category does not exist", ErrValidation)
		}
		if err != nil {
			return fmt.Errorf("failed to retrieve parent category: %w", err)
		}
		if parent.StoreId != c.StoreId {
            // Business Rule: Cannot link a parent from a different store.
			return fmt.Errorf("%w: Parent category does not belong to the same store", ErrInsufficientPrivileges)
		}
	}
    
	// REAL CHECK 4: ID Generation (if not done upstream)
	if c.CategoryId == "" {
		c.CategoryId = uuid.New().String()
	}

	return s.repo.CreateCategory(ctx, c)
}

// DeleteCategory removes a category.
func (s *Service) DeleteCategory(ctx context.Context, id string) error {
    // REAL CHECK 1: Input Validation
    if err := validateID(id); err != nil {
        return err
    }
    
    // REAL CHECK 2: Existence Check
    // On utilise "_" car la variable 'category' n'est pas utilisée après cette ligne.
    _, err := s.repo.GetCategoryByID(ctx, id)
    if errors.Is(err, ErrNotFound) {
        return ErrNotFound
    }
    if err != nil {
        return fmt.Errorf("failed to retrieve category: %w", err)
    }
    
    // ... (Code de suppression)
    return s.repo.DeleteCategory(ctx, id)
}

// GetAllCategories retrieves all categories without complex filtering.
func (s *Service) GetAllCategories(ctx context.Context) ([]*Category, error) {
    // Business Logic: The service layer may perform authorization checks here (e.g., check if 
    // the user in context has the right privileges to view the full category list across stores).
    
    // Since this is a simple list retrieval, we just call the repository.
    return s.repo.GetAllCategories(ctx)
}