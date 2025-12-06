describe("Admin Dashboard", () => {
  it("affiche la liste des boutiques sur /admin/home", () => {
    cy.visit("/admin/home");

    cy.contains("Mes boutiques").should("be.visible");
    cy.contains("Gérez et créez vos boutiques e-commerce").should("be.visible");

    cy.contains("Créer une boutique").should("be.visible");
  });

  it("permet d'accéder au dashboard d'une boutique via le bouton 'Administrer'", () => {
    cy.visit("/admin/home");

    cy.contains("Administrer").first().click();

    cy.url().should("match", /\/admin\/.+\/dashboard$/);

    cy.contains("Tableau de bord").should("be.visible");
    cy.contains("Vue d'ensemble de votre boutique").should("be.visible");
  });

  it("permet d'aller à la page de création de boutique", () => {
    cy.visit("/admin/home");

    cy.contains("Créer une boutique").click();

    cy.url().should("include", "/admin/platform/create-shop");
    cy.contains("Donnez un nom à votre boutique").should("be.visible");
  });
});
