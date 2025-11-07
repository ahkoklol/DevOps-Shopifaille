package product_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	. "github.com/ahkoklol/DevOps-Shopify/back/products/internal/product" // Import the package under test
)

// --- MOCK REPOSITORY ---
// MockRepository is a mock implementation of the Repository interface.
type MockRepository struct {
	mock.Mock
}

// Ensure the MockRepository implements the Repository interface fully
var _ Repository = (*MockRepository)(nil)

func (m *MockRepository) FindByID(ctx context.Context, id string) (*Product, error) {
	args := m.Called(ctx, id)
	// Return nil if args[0] is nil, otherwise cast to *Product
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Product), args.Error(1)
}

func (m *MockRepository) FindByCategory(ctx context.Context, categoryId string, page, size int) ([]*Product, int, error) {
	args := m.Called(ctx, categoryId, page, size)
	return args.Get(0).([]*Product), args.Get(1).(int), args.Error(2)
}

func (m *MockRepository) FindAll(ctx context.Context, page, size int, filters map[string]string) ([]*Product, int, error) {
	args := m.Called(ctx, page, size, filters)
	return args.Get(0).([]*Product), args.Get(1).(int), args.Error(2)
}

func (m *MockRepository) Create(ctx context.Context, p *Product) error {
	args := m.Called(ctx, p)
	return args.Error(0)
}

func (m *MockRepository) Update(ctx context.Context, p *Product) error {
	args := m.Called(ctx, p)
	return args.Error(0)
}

func (m *MockRepository) Delete(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockRepository) GetStockLevel(ctx context.Context, productId string) (int, error) {
	args := m.Called(ctx, productId)
	return args.Int(0), args.Error(1)
}

func (m *MockRepository) CreateCategory(ctx context.Context, c *Category) error {
	args := m.Called(ctx, c)
	return args.Error(0)
}

func (m *MockRepository) DeleteCategory(ctx context.Context, id string) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockRepository) GetCategoryByID(ctx context.Context, id string) (*Category, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Category), args.Error(1)
}

func (m *MockRepository) GetAllCategories(ctx context.Context) ([]*Category, error) {
	args := m.Called(ctx)
	return args.Get(0).([]*Category), args.Error(1)
}

func (m *MockRepository) GetMediaByProductID(ctx context.Context, productID string) ([]*Media, error) {
    args := m.Called(ctx, productID)
    return args.Get(0).([]*Media), args.Error(1)
}

func (m *MockRepository) CreateMedia(ctx context.Context, media *Media) error {
    args := m.Called(ctx, media)
    return args.Error(0)
}

func (m *MockRepository) DeleteMedia(ctx context.Context, mediaID string) error {
    args := m.Called(ctx, mediaID)
    return args.Error(0)
}

func (m *MockRepository) FindCategoryByNameAndParentID(ctx context.Context, name string, parentID *string) (*Category, error) {
	args := m.Called(ctx, name, parentID)
	
    // Checks if the first argument (Category) is nil or a mock object
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Category), args.Error(1)
}

func (m *MockRepository) CreateVariant(ctx context.Context, v *Variant) error {
	args := m.Called(ctx, v)
	return args.Error(0)
}

func (m *MockRepository) UpdateProductModifiedDate(ctx context.Context, productID string, modifiedDate time.Time) error {
	args := m.Called(ctx, productID, modifiedDate)
	return args.Error(0)
}

func (m *MockRepository) CheckStock(ctx context.Context, productID string, quantity int) (bool, error) {
    args := m.Called(ctx, productID, quantity)
	return args.Bool(0), args.Error(1)
}

func (m *MockRepository) DecrementStock(ctx context.Context, productID string, quantity int) error {
    args := m.Called(ctx, productID, quantity)
	return args.Error(0)
}

func (m *MockRepository) IncrementStock(ctx context.Context, productID string, quantity int) error {
    args := m.Called(ctx, productID, quantity)
	return args.Error(0)
}

func (m *MockRepository) GetProductPrice(ctx context.Context, productID string) (float64, error) {
    args := m.Called(ctx, productID)
	return args.Get(0).(float64), args.Error(1)
}

// --- TEST SUITE: CreateProduct ---

func TestCreateProduct(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	validProduct := &Product{
		Title: "Test Product Title!",
		Description: "A great description.",
		CategoryId:  uuid.New().String(),
		StoreId:     "store-123",
		Variants:    []Variant{{Sku: "SKU1", Price: 10.0}},
	}
    
    // Reset the product ID for the first test case
    validProduct.ProductId = "" 

	t.Run("Success_ValidProductGeneratesSlugAndID", func(t *testing.T) {
		p := *validProduct 
		// Set expectation: Create should be called once and succeed
		mockRepo.On("Create", ctx, mock.AnythingOfType("*product.Product")).Return(nil).Once()

		err := service.CreateProduct(ctx, &p)

		assert.NoError(t, err)
		assert.NotEmpty(t, p.ProductId, "Product ID should be generated")
		assert.True(t, time.Since(p.DateCreated) < time.Minute, "DateCreated should be recent")
		// The generated slug must match the slugify function logic
		assert.Equal(t, "test-product-title", p.Slug, "Slug should be generated correctly")
		mockRepo.AssertExpectations(t)
	})

	t.Run("Failure_MissingMandatoryFields", func(t *testing.T) {
		cases := []struct {
			name string
			p    *Product
		}{
			{"NilProduct", nil},
			{"NoTitle", &Product{Description: "d", CategoryId: "c", StoreId: "s"}},
			{"NoDescription", &Product{Title: "t", CategoryId: "c", StoreId: "s"}},
			{"NoCategoryID", &Product{Title: "t", Description: "d", StoreId: "s"}},
			{"NoStoreID", &Product{Title: "t", Description: "d", CategoryId: "c"}},
		}

		for _, tc := range cases {
			t.Run(tc.name, func(t *testing.T) {
				err := service.CreateProduct(ctx, tc.p)
				assert.ErrorIs(t, err, ErrValidation)
				mockRepo.AssertNotCalled(t, "Create")
			})
		}
	})
    
    t.Run("Failure_ProvidedIDAlreadyExists", func(t *testing.T) {
        p := *validProduct
        p.ProductId = uuid.New().String()
        
        // Mock the FindByID call to return an existing product (signifying conflict)
        existingProduct := &Product{ProductId: p.ProductId}
		mockRepo.On("FindByID", ctx, p.ProductId).Return(existingProduct, nil).Once()
        
        err := service.CreateProduct(ctx, &p)
        
        assert.ErrorIs(t, err, ErrConflict)
        mockRepo.AssertNotCalled(t, "Create")
    })
    
}

// --- TEST SUITE: GetById ---

func TestGetById(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()
    
    validUUID := uuid.New().String()

	t.Run("Success_ProductFound", func(t *testing.T) {
        expectedProduct := &Product{ProductId: validUUID}
		// Set expectation: FindByID is called with validID and returns a product
		mockRepo.On("FindByID", ctx, validUUID).Return(expectedProduct, nil).Once()

		p, err := service.GetById(ctx, validUUID)

		assert.NoError(t, err)
		assert.Equal(t, expectedProduct, p)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Failure_ProductNotFound", func(t *testing.T) {
		// Set expectation: FindByID is called and returns ErrNotFound
		mockRepo.On("FindByID", ctx, validUUID).Return(nil, ErrNotFound).Once()

		p, err := service.GetById(ctx, validUUID)

		assert.ErrorIs(t, err, ErrNotFound)
		assert.Nil(t, p)
		mockRepo.AssertExpectations(t)
	})

	t.Run("Failure_InvalidIDFormat", func(t *testing.T) {
		invalidID := "not-a-uuid"

		p, err := service.GetById(ctx, invalidID)

		assert.ErrorIs(t, err, ErrValidation)
		assert.Nil(t, p)
		mockRepo.AssertNotCalled(t, "FindByID")
	})
    
    t.Run("Failure_RepositoryError", func(t *testing.T) {
        dbError := errors.New("database connection failure")
        // Set expectation: FindByID is called and returns a generic DB error
		mockRepo.On("FindByID", ctx, validUUID).Return(nil, dbError).Once()

		p, err := service.GetById(ctx, validUUID)

		assert.ErrorIs(t, err, dbError)
		assert.Nil(t, p)
		mockRepo.AssertExpectations(t)
    })
}

// --- TEST SUITE: UpdateProduct ---

func TestUpdateProduct(t *testing.T) {
    mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()
    
    validUUID := uuid.New().String()
    productUpdate := &Product{ProductId: validUUID, Title: "New Title"}

    t.Run("Success_ProductUpdated", func(t *testing.T) {
        // Step 1: Mock existence check (FindByID)
		mockRepo.On("FindByID", ctx, validUUID).Return(&Product{ProductId: validUUID}, nil).Once()
        // Step 2: Mock update call (Update)
        mockRepo.On("Update", ctx, mock.AnythingOfType("*product.Product")).Return(nil).Once()

        err := service.UpdateProduct(ctx, productUpdate)

        assert.NoError(t, err)
        mockRepo.AssertExpectations(t)
        assert.True(t, time.Since(productUpdate.DateModified) < time.Minute, "DateModified should be updated")
    })

    t.Run("Failure_ProductNotFound", func(t *testing.T) {
        // Mock existence check to return ErrNotFound
		mockRepo.On("FindByID", ctx, validUUID).Return(nil, ErrNotFound).Once()

        err := service.UpdateProduct(ctx, productUpdate)

        assert.ErrorIs(t, err, ErrNotFound)
        mockRepo.AssertExpectations(t)
        mockRepo.AssertNotCalled(t, "Update")
    })
    
    t.Run("Failure_InvalidID", func(t *testing.T) {
        invalidProduct := &Product{ProductId: "bad-id"}
        
        err := service.UpdateProduct(ctx, invalidProduct)
        
        assert.ErrorIs(t, err, ErrValidation)
        mockRepo.AssertNotCalled(t, "FindByID")
        mockRepo.AssertNotCalled(t, "Update")
    })
}

// --- TEST SUITE: Utility Functions ---

func TestValidateID(t *testing.T) {
    // Note: Since validateID is unexported (starts with lowercase), we must use the service's methods
    // to test it, or make it public for direct testing. Here we assume it's publicly exposed 
    // for simplicity or test its effect through a public method like GetById (already covered).
    // Let's test the slugify function instead, as it's pure logic and a new addition.
    
    // We will define a local slugify wrapper for testing purposes since the real one is embedded 
    // unexported logic inside service.go (best practice would be to expose pure logic helpers).

    t.Run("Slugify_CleanInput", func(t *testing.T) {
        // Assuming your slugify logic is implemented in service.go
        mockRepo := new(MockRepository)
        service := NewService(mockRepo) // Used just to access CreateProduct which contains slugify logic
        
        productTitle := "My Best Product 2024!"
        
        // This test relies on CreateProduct's internal call to slugify
        p := Product{
            Title: productTitle,
            Description: "A great description.",
            CategoryId:  uuid.New().String(),
            StoreId:     "store-123",
            Variants:    []Variant{{Sku: "SKU1", Price: 10.0}},
        }
        
        // Mock success for the Create call
		mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*product.Product")).Return(nil).Once()

        service.CreateProduct(context.Background(), &p)
        
        expectedSlug := "my-best-product-2024"
        assert.Equal(t, expectedSlug, p.Slug)
        mockRepo.AssertExpectations(t)
    })
    
    t.Run("Slugify_SpecialCharacters", func(t *testing.T) {
        // This test relies on CreateProduct's internal call to slugify
        mockRepo := new(MockRepository)
        service := NewService(mockRepo) 
        
        productTitle := "Product & Co. (Limited Edition)"
        
        p := Product{
            Title: productTitle,
            Description: "d",
            CategoryId:  uuid.New().String(),
            StoreId:     "s",
        }
        
		mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*product.Product")).Return(nil).Once()

        service.CreateProduct(context.Background(), &p)
        
        expectedSlug := "product-co-limited-edition"
        assert.Equal(t, expectedSlug, p.Slug)
    })
}