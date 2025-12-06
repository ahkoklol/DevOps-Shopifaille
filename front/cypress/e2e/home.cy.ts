describe("Home Page", () => {
  it("affiche le hero avec le texte principal", () => {
    cy.visit("/");

    cy.contains("Plateforme e-commerce nouvelle génération").should(
      "be.visible",
    );
    cy.contains("Créez votre boutique e-commerce en quelques clics").should(
      "be.visible",
    );
    cy.contains("Commencer gratuitement").should("be.visible");
    cy.contains("Se connecter").should("be.visible");
  });

  it("navigue vers la page d'inscription / abonnement", () => {
    cy.visit("/");

    cy.contains("Commencer gratuitement").click();

    cy.url().should("include", "/subscribe");
  });

  it("navigue vers la page de connexion admin", () => {
    cy.visit("/");

    cy.contains("Se connecter").click();

    cy.url().should("include", "/admin/login");
    cy.contains("Connexion").should("be.visible");
    cy.contains("Accédez à votre espace administrateur").should("be.visible");
  });
});
