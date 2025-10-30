package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/ahkoklol/DevOps-Shopify/back/products/internal/product" 
)

// PostgresRepository is the concrete implementation of the product.Repository interface.
// It handles all database interactions using a PostgreSQL connection pool.
type PostgresRepository struct {
	db *pgxpool.Pool
}

// NewPostgresRepository creates a new instance of the repository.
// It takes a configured pgxpool.Pool as a dependency.
func NewPostgresRepository(pool *pgxpool.Pool) (*PostgresRepository, error) {
	if pool == nil {
		return nil, errors.New("pgxpool cannot be nil")
	}
	return &PostgresRepository{db: pool}, nil
}

// mapPostgreError maps technical PostgreSQL errors (like duplicate key) to domain errors.
func mapPostgreError(err error) error {
	if err == nil {
		return nil
	}
	
	if errors.Is(err, pgx.ErrNoRows) {
		return product.ErrNotFound
	}

	// MAPPING CRITIQUE: Vérifier les codes d'erreur PostgreSQL (SQLSTATE)
	if pgErr, ok := err.(*pgconn.PgError); ok {
		switch pgErr.Code {
		case "23505": // unique_violation (Ex: slug déjà existant)
			return fmt.Errorf("%w: unique constraint violation", product.ErrConflict)
		case "23503": // foreign_key_violation (Ex: category_id ou store_id non existant)
			// L'erreur est due à une mauvaise donnée en entrée, qui manque une dépendance.
			return fmt.Errorf("%w: referenced category or resource does not exist", product.ErrValidation)
		}
	}

	// Pour toute autre erreur DB non gérée
	return fmt.Errorf("database error: %w", err)
}

// FindByID retrieves a single product from the database by ID.
func (r *PostgresRepository) FindByID(ctx context.Context, id string) (*product.Product, error) {
	query := `
		SELECT product_id, title, description, slug, category_id, store_id, date_created, date_modified
		FROM products 
		WHERE product_id = $1
	`
	p := &product.Product{}
	
    // Use the context for query timeout/cancellation
	row := r.db.QueryRow(ctx, query, id)

	// Scan the result into the struct fields.
	err := row.Scan(
		&p.ProductId, &p.Title, &p.Description, &p.Slug, &p.CategoryId, &p.StoreId, 
		&p.DateCreated, &p.DateModified,
	)

	if err != nil {
        return nil, mapPostgreError(err)
    }

    // 2. Hydrate Variants (NOUVEAU)
    variants, err := r.getVariantsByProductID(ctx, p.ProductId)
    if err != nil {
        // Traiter l'erreur comme critique, car le produit est incomplet sans ses variants
        return nil, fmt.Errorf("failed to hydrate variants for product %s: %w", p.ProductId, err)
    }
    p.Variants = variants

    return p, nil
}

func (r *PostgresRepository) getVariantsByProductID(ctx context.Context, productID string) ([]product.Variant, error) {
    query := `
        SELECT variant_id, product_id, sku, attributes, price, currency, stock_quantity
        FROM variants 
        WHERE product_id = $1
    `
    rows, err := r.db.Query(ctx, query, productID)
    if err != nil {
        return nil, mapPostgreError(err)
    }
    defer rows.Close()

    variants := []product.Variant{}
    for rows.Next() {
        v := product.Variant{}
        err := rows.Scan(
            &v.VariantId, &v.ProductId, &v.Sku, &v.Attributes, &v.Price, &v.Currency, &v.Quantity,
        )
        if err != nil {
            return nil, mapPostgreError(err)
        }
        variants = append(variants, v)
    }
    if err := rows.Err(); err != nil {
        return nil, mapPostgreError(err)
    }
    return variants, nil
}

// Create inserts a new product record into the database, INCLUDING VARIANTS, atomically.
func (r *PostgresRepository) Create(ctx context.Context, p *product.Product) error {
    // 1. Begin Transaction (Reste inchangé)
    tx, err := r.db.Begin(ctx)
    if err != nil {
        return mapPostgreError(err)
    }
    var commitErr error
    defer func() {
        if commitErr != nil {
            tx.Rollback(ctx)
        } else {
            commitErr = tx.Commit(ctx)
        }
    }()

    // 2. Insert Product (Reste inchangé)
    productQuery := `
        INSERT INTO products ( product_id, title, description, slug, category_id, store_id, date_created, date_modified ) 
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )
    `
    _, err = tx.Exec(ctx, productQuery,
        p.ProductId, p.Title, p.Description, p.Slug, p.CategoryId, p.StoreId,
        p.DateCreated, p.DateModified,
    )
    if err != nil {
        commitErr = err
        return mapPostgreError(err)
    }

    // 3. Insert Variants (NOUVEAU)
    variantQuery := `
        INSERT INTO variants (
            variant_id, product_id, sku, attributes, price, currency, stock_quantity
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7 )
    `
    for i := range p.Variants {
        v := &p.Variants[i]
        
        // Assurez-vous que l'ID du produit est assigné à chaque variant.
        v.ProductId = p.ProductId 
        
        // Vous devez aussi vous assurer que v.VariantId a un UUID généré
        // (idéalement dans la couche Service si v.VariantId est vide)
        
        _, err = tx.Exec(ctx, variantQuery,
            v.VariantId, v.ProductId, v.Sku, v.Attributes, v.Price, v.Currency, v.Quantity,
        )
        if err != nil {
            commitErr = err
            return mapPostgreError(err) // Échec => Rollback via defer
        }
    }

    // 4. Commit or Rollback via defer
    return mapPostgreError(commitErr) 
}

// Update modifies an existing product record.
func (r *PostgresRepository) Update(ctx context.Context, p *product.Product) error {
	query := `
		UPDATE products 
		SET title = $1, description = $2, slug = $3, category_id = $4, store_id = $5, date_modified = $6
		WHERE product_id = $7
	`
	result, err := r.db.Exec(ctx, query,
		p.Title, p.Description, p.Slug, p.CategoryId, p.StoreId, p.DateModified, p.ProductId,
	)

	if err != nil {
		return mapPostgreError(err)
	}

	// Check if any row was affected (i.e., if the product existed)
	if result.RowsAffected() == 0 {
		return product.ErrNotFound
	}
	
	return nil
}

// Delete removes a product record by ID.
func (r *PostgresRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM products WHERE product_id = $1`
	
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return mapPostgreError(err)
	}

	if result.RowsAffected() == 0 {
		return product.ErrNotFound
	}
	
	return nil
}

// GetStockLevel retrieves the stock quantity.
func (r *PostgresRepository) GetStockLevel(ctx context.Context, productId string) (int, error) {
	// NOTE: In a normalized schema, stock is usually stored in a Variants table.
	// For simplicity, this query assumes a simple relationship or a direct stock column on 'products' table.
	query := `SELECT COALESCE(SUM(quantity), 0) FROM variants WHERE product_id = $1`
	
	var stock int
	err := r.db.QueryRow(ctx, query, productId).Scan(&stock)

	if errors.Is(err, pgx.ErrNoRows) {
        // If the product has no variants, stock is 0, so no ErrNotFound here unless the product itself doesn't exist.
        // Assuming existence check is done in the Service layer.
		return 0, nil
	}
	
	return stock, mapPostgreError(err)
}

// FindByCategory retrieves products filtered by category ID (placeholder for complex query).
func (r *PostgresRepository) FindByCategory(ctx context.Context, categoryID string, page, size int) ([]*product.Product, int, error) {
	// PLACEHOLDER: Implementation would involve:
	// 1. Calculating OFFSET (page-1) * size.
	// 2. Querying total COUNT separately.
	// 3. Querying actual product rows using LIMIT and OFFSET.
	return nil, 0, errors.New("FindByCategory not implemented in adapter")
}

// FindAll retrieves all products with filtering (placeholder).
func (r *PostgresRepository) FindAll(ctx context.Context, page, size int, filters map[string]string) ([]*product.Product, int, error) {
	// PLACEHOLDER: Implementation would involve dynamic query building based on 'filters'.
	return nil, 0, errors.New("FindAll not implemented in adapter")
}

// --- gRPC Internal Operations (Transactional Logic) ---

// CheckStock verifies if the required quantity is available.
func (r *PostgresRepository) CheckStock(ctx context.Context, productID string, quantity int) (bool, error) {
	// This should ideally join 'products' and 'variants' tables for the total stock.
	currentStock, err := r.GetStockLevel(ctx, productID)
	if err != nil {
		return false, err
	}
	
	return currentStock >= quantity, nil
}

// DecrementStock atomically reduces the quantity in stock for a product (CRITICAL TRANSACTION).
func (r *PostgresRepository) DecrementStock(ctx context.Context, productID string, quantity int) error {
    // CRITICAL 1: Begin transaction immediately.
    tx, err := r.db.Begin(ctx) // <-- tx is declared here
    if err != nil {
        return mapPostgreError(err)
    }

    // CRITICAL 2: Defer the closing of the transaction.
    // We use a named variable 'commitErr' to ensure the defer function always cleans up.
    var commitErr error
    defer func() {
        if commitErr != nil {
            tx.Rollback(ctx)
            // Note: We intentionally don't check the Rollback error; we prioritize reporting the initial error.
        } else {
            // Commit if everything went well. The Commit error is the primary error returned.
            commitErr = tx.Commit(ctx)
        }
    }()

    // CRITICAL 3: Use the CORRECT table and column names (variants, stock_quantity).
    execQuery := `
        UPDATE variants 
        SET stock_quantity = stock_quantity - $1 
        WHERE product_id = $2 AND stock_quantity >= $1
        -- NOTE: This updates ALL variants of the product. 
	`
    result, err := tx.Exec(ctx, execQuery, quantity, productID)
    
    if err != nil {
        commitErr = err // Capture the error to trigger Rollback in defer
        return mapPostgreError(err)
    }

    if result.RowsAffected() == 0 {
        // No row was updated because stock_quantity < quantity, or product_id not found.
        commitErr = product.ErrOutOfStock // Capture the domain error
        return product.ErrOutOfStock 
    }
    
    // If successful, commitErr remains nil, and the defer block commits the transaction.
    // The error returned by tx.Commit(ctx) is captured by the defer func and assigned to commitErr.
    // We return this error implicitly via the defer structure or explicitly check it if needed.
    // Since we assigned commitErr = tx.Commit(ctx) in the defer, we MUST return that value.
    
    return mapPostgreError(commitErr) // Return the result of the commit (which is nil on success)
}

// IncrementStock atomically increases the quantity in stock (CRITICAL TRANSACTION).
func (r *PostgresRepository) IncrementStock(ctx context.Context, productID string, quantity int) error {
	// CORRECTION: Must target the 'variants' table and use the 'stock_quantity' column.
	query := `
		UPDATE variants 
		SET stock_quantity = stock_quantity + $1 
		WHERE product_id = $2
	`
	_, err := r.db.Exec(ctx, query, quantity, productID)

	return mapPostgreError(err)
}

// GetProductPrice retrieves the price.
func (r *PostgresRepository) GetProductPrice(ctx context.Context, productID string) (float64, error) {
	query := `SELECT price FROM variants WHERE product_id = $1 LIMIT 1` // Assuming price is on the variant
	var price float64
	err := r.db.QueryRow(ctx, query, productID).Scan(&price)

	if errors.Is(err, pgx.ErrNoRows) {
		return 0, product.ErrNotFound // If no variants/price found for the product
	}
	
	return price, mapPostgreError(err)
}

// GetCategoryByID retrieves a category by its ID.
func (r *PostgresRepository) GetCategoryByID(ctx context.Context, id string) (*product.Category, error) {
	query := `
		SELECT category_id, name, store_id, parent_id
		FROM categories 
		WHERE category_id = $1
	`
	c := &product.Category{}
	
	row := r.db.QueryRow(ctx, query, id)

	// Note: pgx handles scanning into a pointer field (*string for ParentId)
	err := row.Scan(
		&c.CategoryId, &c.Name, &c.ParentId, 
	)

	return c, mapPostgreError(err)
}

// CreateCategory inserts a new category record.
func (r *PostgresRepository) CreateCategory(ctx context.Context, c *product.Category) error {
	query := `
		INSERT INTO categories (
			category_id, name, store_id, parent_id
		) VALUES (
			$1, $2, $3, $4
		)
	`
	// Utilise c.ParentId (*string) qui sera mappé à NULL si le pointeur est nil.
	_, err := r.db.Exec(ctx, query,
		c.CategoryId, c.Name, c.ParentId,
	)

	// mapPostgreError doit gérer pgErr.Code == "23505" (conflit unique) ou "23503" (FK violation).
	return mapPostgreError(err)
}

// DeleteCategory removes a category by ID.
func (r *PostgresRepository) DeleteCategory(ctx context.Context, id string) error {
	query := `DELETE FROM categories WHERE category_id = $1`
	
	result, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return mapPostgreError(err)
	}

	if result.RowsAffected() == 0 {
		return product.ErrNotFound
	}
	
	// Si le DELETE échoue en raison de la contrainte FK (products_category_id_fkey), 
	// mapPostgreError doit le mapper à product.ErrConflict.
	return nil
}

// GetAllCategories retrieves all category records from the database.
func (r *PostgresRepository) GetAllCategories(ctx context.Context) ([]*product.Category, error) {
	query := `
		SELECT category_id, name, store_id, parent_id
		FROM categories
		ORDER BY name ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, mapPostgreError(err)
	}
	defer rows.Close()

	categories := []*product.Category{}
	for rows.Next() {
		c := &product.Category{}
		
		// Scan the result into the struct fields.
		err := rows.Scan(
			&c.CategoryId, &c.Name, &c.ParentId, // ParentId est un *string
		)
		if err != nil {
			return nil, mapPostgreError(err)
		}
		categories = append(categories, c)
	}

	// Check for any error encountered during iteration
	if err := rows.Err(); err != nil {
		return nil, mapPostgreError(err)
	}

	return categories, nil
}

// CreateMedia inserts a new media record associated with a product.
func (r *PostgresRepository) CreateMedia(ctx context.Context, m *product.Media) error {
	query := `
		INSERT INTO product_media (
			media_id, product_id, url, alt, sort_order
		) VALUES (
			$1, $2, $3, $4, $5
		)
	`
	// NOTE: Ensure your database table for media is named 'product_media' 
	// and has columns matching the fields: media_id, product_id, url, alt, sort_order.
	_, err := r.db.Exec(ctx, query,
		m.MediaId, m.ProductId, m.Url, m.Alt, m.SortOrder,
	)

	// mapPostgreError handles unique constraint violations or foreign key errors.
	return mapPostgreError(err)
}

// GetMediaByProductID retrieves all media linked to a product ID.
func (r *PostgresRepository) GetMediaByProductID(ctx context.Context, productID string) ([]*product.Media, error) {
	query := `
		SELECT media_id, product_id, url, alt, sort_order
		FROM product_media 
		WHERE product_id = $1
		ORDER BY sort_order ASC
	`
	rows, err := r.db.Query(ctx, query, productID)
	if err != nil {
		return nil, mapPostgreError(err)
	}
	defer rows.Close()

	mediaList := []*product.Media{}
	for rows.Next() {
		m := &product.Media{}
		
		err := rows.Scan(
			&m.MediaId, &m.ProductId, &m.Url, &m.Alt, &m.SortOrder,
		)
		if err != nil {
			return nil, mapPostgreError(err)
		}
		mediaList = append(mediaList, m)
	}

	if err := rows.Err(); err != nil {
		return nil, mapPostgreError(err)
	}

	return mediaList, nil
}

// DeleteMedia removes a media record by its unique MediaId.
func (r *PostgresRepository) DeleteMedia(ctx context.Context, mediaID string) error {
	query := `DELETE FROM product_media WHERE media_id = $1`
	
	result, err := r.db.Exec(ctx, query, mediaID)
	if err != nil {
		return mapPostgreError(err)
	}

	if result.RowsAffected() == 0 {
		return product.ErrNotFound
	}
	
	return nil
}