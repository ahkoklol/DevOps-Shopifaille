/// <reference types="cypress" />

describe("Page Cart", () => {
  const shopId = "shop-2";
  const url = `/shop/${shopId}/panier`;

  it("Affiche le panier correctement", () => {
    cy.visit(url);

    it("Permet d'augmenter la quantité d'un produit", () => {
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="quantity"]').invoke("text").then((before) => {
          const qBefore = Number(before);

          cy.get('[data-cy="btn-plus"]').click();

          cy.get('[data-cy="quantity"]').invoke("text").should((after) => {
            expect(Number(after)).to.eq(qBefore + 1);
          });
        });
      });
    });

    it("Permet de diminuer la quantité d'un produit", () => {
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="quantity"]').invoke("text").then((before) => {
          const qBefore = Number(before);

          cy.get('[data-cy="btn-minus"]').click();

          cy.get('[data-cy="quantity"]').invoke("text").should((after) => {
            expect(Number(after)).to.eq(Math.max(1, qBefore - 1));
          });
        });
      });
    });

    it("Permet de supprimer un produit du panier", () => {
      cy.get('[data-cy="cart-item"]').then((items) => {
        const countBefore = items.length;

        cy.get('[data-cy="cart-item"]').first().within(() => {
          cy.get('[data-cy="btn-remove"]').click();
        });

        cy.get('[data-cy="cart-item"]').should("have.length", countBefore - 1);
      });
    });

    it("Bouton 'Passer la commande' redirige vers checkout", () => {
      cy.visit(url);

      cy.contains("Passer la commande").click();

      cy.url().should("include", `/shop/${shopId}/checkout`);
    });

    it("Bouton 'Continuer mes achats' redirige vers catalogue", () => {
      cy.visit(url);

      cy.contains("Continuer mes achats").click();

      cy.url().should("include", `/shop/${shopId}/catalog`);
    });

    it("Affiche 'Boutique introuvable' si le shop n'existe pas", () => {
      cy.visit("/shop/inexistant/cart");

      cy.contains("Boutique introuvable").should("be.visible");
    });
  });
});
