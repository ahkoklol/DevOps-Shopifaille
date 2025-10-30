CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    
    -- Utilise 'UUID' pour la FK auto-référencée. NULL si c'est une catégorie racine.
    parent_id UUID REFERENCES categories(category_id) ON DELETE SET NULL, 
    
    -- NOUVELLE CONTRAINTE D'UNICITÉ: Le nom de la catégorie doit être unique globalement pour un parent donné.
    UNIQUE (name, parent_id)
);

CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL,
    
    -- Clé étrangère vers la table categories
    category_id UUID NOT NULL REFERENCES categories(category_id) ON DELETE RESTRICT,
    
    -- Id du magasin (non modélisé ici, mais supposé être un UUID ou VARCHAR)
    store_id VARCHAR(50) NOT NULL, 
    
    -- Horodatages
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

    -- Contraintes d'unicité critiques
    UNIQUE (slug),
    UNIQUE (product_id, store_id) -- Un produit est unique dans le contexte de son magasin
);

CREATE TABLE variants (
    variant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Clé étrangère vers la table products. ON DELETE CASCADE supprime les variantes si le produit est supprimé.
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    
    sku VARCHAR(100) NOT NULL,
    
    -- Utilisation de JSONB pour les attributs dynamiques (taille, couleur, etc.) – plus rapide pour l'interrogation que JSON
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) NOT NULL,
    
    -- Stock. Une colonne critique gérée de manière transactionnelle.
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),

    -- Contraintes d'unicité
    UNIQUE (sku),
    UNIQUE (product_id, attributes) -- Un produit ne peut pas avoir deux variantes avec les mêmes attributs
);

CREATE TABLE media (
    media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Clé étrangère vers la table products
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    
    url VARCHAR(2048) NOT NULL,
    alt VARCHAR(500),
    
    -- Ordre d'affichage
    sort_order INT NOT NULL DEFAULT 0,

    -- Unicité: une URL ne devrait être associée qu'une seule fois à un produit
    UNIQUE (product_id, url)
);