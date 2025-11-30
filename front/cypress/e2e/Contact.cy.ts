/// <reference types="cypress" />

describe("Page Contact", () => {
  const shopId = "shop-1"; 
  const url = `/shop/${shopId}/contact`;

  beforeEach(() => {
    cy.visit(url);
  });

  it("Affiche le titre de la page", () => {
    cy.contains("h1", "Contact", { matchCase: false }).should("exist");
  });

  it("Affiche la description si présente", () => {
    cy.get("p").should("exist");
  });

  it("Affiche les sections : téléphone, email, adresse", () => {
    cy.contains("Téléphone").should("exist");
    cy.contains("E-mail").should("exist");
    cy.contains("Adresse").should("exist");
  });

  it("Affiche le bouton 'Appeler' si numéro présent", () => {
    cy.contains("Téléphone").parent().within(() => {
      cy.get("a[href^='tel']").should("exist");
    });
  });

  it("Affiche le bouton 'Écrire un e-mail' si email présent", () => {
    cy.contains("E-mail").parent().within(() => {
      cy.get("a[href^='mailto']").should("exist");
    });
  });

  it("Affiche un lien Google Maps si adresse présente", () => {
    cy.contains("Adresse").parent().within(() => {
      cy.get("a[target='_blank']").should("exist");
    });
  });

  it("Affiche les horaires d'ouverture", () => {
    cy.contains("Horaires").should("exist");
    cy.contains("Lun–Ven").should("exist");
    cy.contains("Samedi").should("exist");
    cy.contains("Dimanche").should("exist");
  });

  it("Affiche les 3 features (réassurance)", () => {
    cy.contains("Livraison rapide").should("exist");
    cy.contains("Qualité garantie").should("exist");
    cy.contains("Service client").should("exist");
  });

  it("Le footer s'affiche", () => {
    cy.contains("Tous droits réservés").should("exist");
  });
});
