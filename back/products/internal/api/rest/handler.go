package rest

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/ahkoklol/DevOps-Shopify/back/products/internal/product"
)

// Service defines the methods required by the REST handlers.
// This interface allows the handler to be decoupled from the concrete implementation of the Service.
type Service interface {
	GetById(ctx context.Context, id string) (*product.Product, error)
	SearchByCategory(ctx context.Context, categoryId string, page, size int) ([]*product.Product, int, error)
	GetAll(ctx context.Context, page, size int, filters map[string]string) ([]*product.Product, int, error)
	CreateProduct(ctx context.Context, p *product.Product) error
	UpdateProduct(ctx context.Context, p *product.Product) error
	DeleteProduct(ctx context.Context, id string) error
	GetProductStockLevel(ctx context.Context, productId string) (int, error)
	CreateCategory(ctx context.Context, c *product.Category) error
	DeleteCategory(ctx context.Context, id string) error
	GetAllCategories(ctx context.Context) ([]*product.Category, error)
}

// Handler holds the business logic service dependency.
type Handler struct {
	service Service
}

// NewHandler creates a new REST handler instance.
func NewHandler(s Service) *Handler {
	return &Handler{service: s}
}

// responseError maps domain-specific errors to appropriate HTTP status codes and writes the response.
func responseError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	message := "Internal Server Error"

	// Map domain errors to HTTP status codes
	if errors.Is(err, product.ErrNotFound) {
		status = http.StatusNotFound // 404
		message = err.Error()
	} else if errors.Is(err, product.ErrValidation) {
		status = http.StatusBadRequest // 400
		message = err.Error()
	} else if errors.Is(err, product.ErrConflict) {
		status = http.StatusConflict // 409
		message = err.Error()
	} else if errors.Is(err, product.ErrInsufficientPrivileges) {
        status = http.StatusForbidden // 403
        message = err.Error()
    } else {
        // Log the internal error before sending a generic 500 response
        fmt.Printf("Unhandled internal error: %v\n", err)
    }

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// GetProducts handles GET /products and GET /products?categoryId={id} endpoints.
func (h *Handler) GetProducts(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	query := r.URL.Query()

	// 1. Parse Pagination Parameters
	page, size := 1, 20
	if p, err := strconv.Atoi(query.Get("page")); err == nil && p > 0 {
		page = p
	}
	if s, err := strconv.Atoi(query.Get("size")); err == nil && s > 0 {
		size = s
	}

	// 2. Parse Filters
	filters := make(map[string]string)
	for key, values := range query {
		if key != "page" && key != "size" && len(values) > 0 {
			filters[key] = values[0]
		}
	}

	var products []*product.Product
	var total int
	var err error

	categoryId := query.Get("categoryId")

	if categoryId != "" {
		// Route: GET /products?categoryId={id}
		products, total, err = h.service.SearchByCategory(ctx, categoryId, page, size)
	} else {
		// Route: GET /products?{filters}
		products, total, err = h.service.GetAll(ctx, page, size, filters)
	}

	if err != nil {
		responseError(w, err)
		return
	}

	// 3. Send Response (200 OK)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
    // Include pagination headers (or wrapper struct) in a real application
    w.Header().Set("X-Total-Count", strconv.Itoa(total))
	json.NewEncoder(w).Encode(products)
}

// GetProductByID handles GET /products/{id} endpoint.
func (h *Handler) GetProductByID(w http.ResponseWriter, r *http.Request) {
    // NOTE: In a real app, you would use a router helper (e.g., mux.Vars(r)) to extract the {id}.
    // We assume the router has extracted the ID and stored it in a generic way for demonstration.
    id := r.Context().Value("product_id").(string) // Placeholder for router variable extraction
	
	p, err := h.service.GetById(r.Context(), id)

	if err != nil {
		responseError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // 200 OK
	json.NewEncoder(w).Encode(p)
}

// CreateProduct handles POST /products endpoint.
func (h *Handler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var p product.Product

	// 1. Decode incoming JSON body into the Product struct
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		responseError(w, fmt.Errorf("%w: invalid JSON body", product.ErrValidation))
		return
	}

	// 2. Call the business logic
	if err := h.service.CreateProduct(r.Context(), &p); err != nil {
		responseError(w, err)
		return
	}

	// 3. Send Response (201 Created)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201 Created
	json.NewEncoder(w).Encode(p) // Return the newly created object (now with generated ID and timestamps)
}

// UpdateProduct handles PUT /products/{id} endpoint.
func (h *Handler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
    // NOTE: Assume product_id is extracted from the URL path as in GetProductByID.
    id := r.Context().Value("product_id").(string) // Placeholder for router variable extraction

	var p product.Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		responseError(w, fmt.Errorf("%w: invalid JSON body", product.ErrValidation))
		return
	}

    // CRITICAL: Ensure the ID from the URL path is used for the update.
    p.ProductId = id 

	// 1. Call the business logic
	if err := h.service.UpdateProduct(r.Context(), &p); err != nil {
		responseError(w, err)
		return
	}

	// 2. Send Response (200 OK - or 204 No Content for standard PUT)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(p)
}

// DeleteProduct handles DELETE /products/{id} endpoint.
func (h *Handler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
    // NOTE: Assume product_id is extracted from the URL path.
    id := r.Context().Value("product_id").(string) // Placeholder for router variable extraction

	// 1. Call the business logic
	if err := h.service.DeleteProduct(r.Context(), id); err != nil {
		responseError(w, err)
		return
	}

	// 2. Send Response (204 No Content)
	w.WriteHeader(http.StatusNoContent)
}

// GetStockLevelHandler handles GET /products/{id}/stock endpoint.
func (h *Handler) GetStockLevelHandler(w http.ResponseWriter, r *http.Request) {
    // NOTE: Assume product_id is extracted from the URL path.
    id := r.Context().Value("product_id").(string) // Placeholder for router variable extraction

	stock, err := h.service.GetProductStockLevel(r.Context(), id)

	if err != nil {
		responseError(w, err)
		return
	}

	// 1. Send Response (200 OK)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
    // Structure the response clearly (e.g., {"stock_level": 5})
	json.NewEncoder(w).Encode(map[string]int{"stock_level": stock})
}

// CreateCategoryHandler handles POST /categories endpoint. (Admin/Merchant UI)
func (h *Handler) CreateCategoryHandler(w http.ResponseWriter, r *http.Request) {
	var c product.Category

	// 1. Decode incoming JSON body
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		responseError(w, fmt.Errorf("%w: invalid JSON body", product.ErrValidation))
		return
	}

	// 2. Call the business logic
	if err := h.service.CreateCategory(r.Context(), &c); err != nil {
		responseError(w, err)
		return
	}

	// 3. Send Response (201 Created)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201 Created
	json.NewEncoder(w).Encode(c) // Return the newly created object
}

// DeleteCategoryHandler handles DELETE /categories/{id} endpoint. (Admin/Merchant UI)
func (h *Handler) DeleteCategoryHandler(w http.ResponseWriter, r *http.Request) {
    // NOTE: Assume category_id is extracted from the URL path.
    id := r.Context().Value("category_id").(string) // Placeholder for router variable extraction

	// 1. Call the business logic
	if err := h.service.DeleteCategory(r.Context(), id); err != nil {
		responseError(w, err)
		return
	}

	// 2. Send Response (204 No Content)
	w.WriteHeader(http.StatusNoContent)
}

// GetCategoriesHandler handles GET /categories endpoint (for listing all categories).
func (h *Handler) GetCategoriesHandler(w http.ResponseWriter, r *http.Request) {
    categories, err := h.service.GetAllCategories(r.Context())

	if err != nil {
		responseError(w, err)
		return
	}

	// 1. Send Response (200 OK)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(categories) // Returns the list of categories
}