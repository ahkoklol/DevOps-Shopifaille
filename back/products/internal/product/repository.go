package product

import (
    "context"
)

type Repository interface {

	// REST methods

	// FindByID retrieves a single product by its ID. Returns nil, nil if not found.
	FindByID(ctx context.Context, id string) (*Product, error)

	// FindByCategory retrieves a paginated list of products for a given category.
	// Returns a slice of products and the total count.
	FindByCategory(ctx context.Context, categoryId string, page, size int) ([]*Product, int, error)

	// FindAll retrieves all products, supporting pagination/filtering for GET /products.
	FindAll(ctx context.Context, page, size int, filters map[string]string) ([]*Product, int, error)

	// Create saves a new product to the database. The pointer is used so the ID can be set.
	Create(ctx context.Context, p *Product) error

	// Update modifies an existing product.
	Update(ctx context.Context, p *Product) error

	// Delete removes a product by its ID.
	Delete(ctx context.Context, id string) error
	
	// GetStockLevel retrieves the stock level for a product.
	GetStockLevel(ctx context.Context, productId string) (int, error)

	// CreateCategory inserts a new category record.
	CreateCategory(ctx context.Context, c *Category) error
    
    // DeleteCategory removes a category by ID.
	DeleteCategory(ctx context.Context, id string) error
    
    // GetCategoryByID is helpful for validation and lookup.
    GetCategoryByID(ctx context.Context, id string) (*Category, error)

	// GetAllCategories retrieves a list of all categories.
	GetAllCategories(ctx context.Context) ([]*Category, error)

	GetMediaByProductID(ctx context.Context, productID string) ([]*Media, error)

	// CreateMedia saves a new media item to the database.
	CreateMedia(ctx context.Context, m *Media) error

	// DeleteMedia removes a media item by its ID.
	DeleteMedia(ctx context.Context, mediaID string) error

	FindCategoryByNameAndParentID(ctx context.Context, name string, parentID *string) (*Category, error)


	// gRPC methods
}