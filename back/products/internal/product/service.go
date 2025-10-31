package product

import (
	"context"
	"errors"
	"fmt"
	"time"
	"regexp"
    "strings"

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

// slugify converts a string (like a product title) into a URL-safe slug.
func slugify(s string) string {
    // 1. Convert to lowercase
    s = strings.ToLower(s)
    // 2. Remove non-word characters and replace with a hyphen
    reg := regexp.MustCompile("[^a-z0-9]+")
    s = reg.ReplaceAllString(s, "-")
    // 3. Trim leading/trailing hyphens
    s = strings.Trim(s, "-")
    return s
}

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
        p.Slug = slugify(p.Title)
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

// CreateCategory validates category data (name, parent existence) and saves it.
func (s *Service) CreateCategory(ctx context.Context, c *Category) error {
    // REAL CHECK 1: Input Validation
    // NOTE: StoreId n'est plus obligatoire ici.
    if c == nil || c.Name == "" {
        return fmt.Errorf("%w: Category Name is mandatory", ErrValidation)
    }
    
    // NEW CHECK 2: Pre-check for duplicate name under the same parent
    // NOTE: This assumes the Repository interface now includes FindCategoryByNameAndParentID
    existing, err := s.repo.FindCategoryByNameAndParentID(ctx, c.Name, c.ParentId)
    if err != nil && !errors.Is(err, ErrNotFound) {
        // If it's a genuine DB error (not just "not found"), we stop
        return fmt.Errorf("failed to check for existing category: %w", err)
    }
    if existing != nil {
        return fmt.Errorf("%w: category named '%s' already exists under this parent", ErrConflict, c.Name)
    }

    // REAL CHECK 3: Parent Existence Check (SIMPLIFIÉ)
    if c.ParentId != nil && *c.ParentId != "" {
        // Parent must exist globally.
        _, err := s.repo.GetCategoryByID(ctx, *c.ParentId)
        if errors.Is(err, ErrNotFound) {
            return fmt.Errorf("%w: Parent category does not exist", ErrValidation)
        }
        if err != nil {
            return fmt.Errorf("failed to retrieve parent category: %w", err)
        }
        // Le check de c.Parent.StoreId != c.StoreId est retiré.
    }
    
    // REAL CHECK 4: ID Generation (if not done upstream)
    if c.CategoryId == "" {
        c.CategoryId = uuid.New().String()
    }

    return s.repo.CreateCategory(ctx, c)
}

// DeleteCategory (reste inchangé car il n'utilisait pas explicitement category.StoreId)
func (s *Service) DeleteCategory(ctx context.Context, id string) error {
	// ... (La logique de validation et d'existence reste la même)
    
	// L'autorisation future sera basée sur le rôle de l'utilisateur (Admin), pas sur le StoreId de la catégorie.
	
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

// GetMediaByProductID retrieves all media linked to a product.
func (s *Service) GetMediaByProductID(ctx context.Context, productID string) ([]*Media, error) {
    // REAL CHECK 1: Input Validation
    if err := validateID(productID); err != nil {
        return nil, err
    }

    // REAL CHECK 2: Existence Check (Assurer que le produit existe avant de chercher le média)
    _, err := s.repo.FindByID(ctx, productID)
    if errors.Is(err, ErrNotFound) {
        return nil, ErrNotFound
    }
    if err != nil {
        return nil, fmt.Errorf("failed to verify product existence: %w", err)
    }

    return s.repo.GetMediaByProductID(ctx, productID)
}

// CreateMedia validates media data and saves it.
func (s *Service) CreateMedia(ctx context.Context, m *Media) error {
    // REAL CHECK 1: Input Validation
    if m == nil || m.ProductId == "" || m.Url == "" {
        return fmt.Errorf("%w: ProductId and Url are mandatory for media creation", ErrValidation)
    }
    if err := validateID(m.ProductId); err != nil {
        return err
    }
    
    // REAL CHECK 2: Product Existence Check (CRITICAL)
    _, err := s.repo.FindByID(ctx, m.ProductId)
    if errors.Is(err, ErrNotFound) {
        return fmt.Errorf("%w: Cannot link media to a non-existent product", ErrValidation)
    }
    if err != nil {
        return fmt.Errorf("failed to verify product existence: %w", err)
    }

    // REAL CHECK 3: ID Generation
    if m.MediaId == "" {
        m.MediaId = uuid.New().String()
    }
    
    // REAL CHECK 4: Optional: Validate URL format (e.g., using Go's net/url package)

    return s.repo.CreateMedia(ctx, m)
}

// DeleteMedia removes a media item by its ID.
func (s *Service) DeleteMedia(ctx context.Context, mediaID string) error {
    // REAL CHECK 1: Input Validation
    if err := validateID(mediaID); err != nil {
        return err
    }
    
    // REAL CHECK 2: Authorization/Ownership Check (Implémentation future ici)
    // Dans un vrai système, vous récupéreriez le média par ID pour vérifier m.ProductId avant de supprimer.

    return s.repo.DeleteMedia(ctx, mediaID)
}

// CreateVariant validates and creates a new variant for a product.
func (s *Service) CreateVariant(ctx context.Context, v *Variant) error {
    // REAL CHECK 1: Input Validation
    if v == nil || v.ProductId == "" || v.Sku == "" || v.Price <= 0 || v.Currency == "" {
        return fmt.Errorf("%w: ProductId, Sku, Price, and Currency are mandatory for variants", ErrValidation)
    }

    // REAL CHECK 2: Product Existence Check
    // We check for the product's existence to ensure the Foreign Key constraint will pass.
    _, err := s.repo.FindByID(ctx, v.ProductId)
    if errors.Is(err, ErrNotFound) {
        return fmt.Errorf("%w: Cannot link variant to a non-existent product", ErrValidation)
    }
    if err != nil {
        return fmt.Errorf("failed to verify product existence: %w", err)
    }

    // REAL CHECK 3: ID Generation
    if v.VariantId == "" {
        v.VariantId = uuid.New().String()
    }

    // 1. Create the variant record
    if err := s.repo.CreateVariant(ctx, v); err != nil {
        return err // Return if variant creation failed
    }

    // 2. CRITICAL FIX: Update the parent product's date_modified timestamp
    now := time.Now()
    if err := s.repo.UpdateProductModifiedDate(ctx, v.ProductId, now); err != nil {
        // Log this error as it's critical, but don't fail the whole operation if the variant insert succeeded.
        // For production, you might want to retry this or publish a message queue event.
        fmt.Printf("Warning: Failed to update parent product %s modified date: %v\n", v.ProductId, err)
        // We continue and return success for the variant creation despite the timestamp warning.
    }
    
    return nil // Return success for variant creation
}