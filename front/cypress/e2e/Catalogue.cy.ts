/// <reference types="cypress" />

describe("Catalogue", () => {
  const shopId = "shop-1";
  const url = `/shop/${shopId}/catalogue`;

  beforeEach(() => {
    cy.visit(url);
  });

  it("Affiche la page catalogue", () => {
    cy.contains("Notre catalogue").should("exist");
    cy.get("[data-cy='product-card']").should("exist");
  });

  it("Affiche le bon nombre de produits", () => {
    cy.get("[data-cy='product-card']").then(($cards) => {
      const countOnPage = $cards.length;

      cy.contains(`${countOnPage} produit`).should("exist");
    });
  });

  it("Filtre par catégorie", () => {
    cy.get("[data-cy='filter-category']").first().click();

    cy.get("[data-cy='product-card']").should("exist");
  });

  it("Filtre par prix (moins de 50€)", () => {
    cy.get("[data-cy='filter-price']").first().check({ force: true });

    cy.get("[data-cy='product-card']").each(($card) => {
      cy.wrap($card).contains("€");
    });
  });

  it("Navigue vers un produit", () => {
    cy.get("[data-cy='product-card']").first().click();

    cy.url().should("include", `/shop/${shopId}/product/`);
  });

  it("Si la boutique n’existe pas → affiche message", () => {
    cy.visit("/shop/xxxxx/catalogue");

    cy.contains("Boutique introuvable").should("exist");
  });
});
