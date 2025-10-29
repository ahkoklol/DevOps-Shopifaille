package product

import (
	"encoding/json"
	"time"
)

// In Go, a variable or a field has to start by an uppercase letter to be exported (be visible outside the package)

type Product struct {
	ProductId string `json:"product_id"`
	Title string `json:"title"`
	Description string `json:"description"`
	Slug string `json:"slug"`
	CategoryId string `json:"category_id"`
	StoreId string `json:"store_id"`
	DateCreated time.Time `json:"date_created"`
	DateModified time.Time `json:"date_modified"`
}

type Variant struct {
	VariantId string `json:"variant_id"`
	ProductId string `json:"product_id"`
	Sku string `json:"sku"`
	Attributes json.RawMessage `json:"attributes"`
	Price float64 `json:"price"`
	Currency string `json:"currency"`
	Quantity int `json:"stock_quantity"`
}

type Category struct {
	CategoryId string `json:"category_id"`
	Name string `json:"name"`
	ParentId *string `json:"parent_id"`
}

type Media struct {
	MediaId string `json:"media_id"`
	ProductId string `json:"product_id"`
	Url string `json:"url"`
	Alt string `json:"alt"`
	SortOrder int `json:"sort_order"`
}