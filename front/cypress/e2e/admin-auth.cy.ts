describe("Admin Auth", () => {
  it("affiche le formulaire de connexion avec tous les champs", () => {
    cy.visit("/admin/login");

    cy.contains("WayneShopifaille").should("be.visible");
    cy.contains("Connexion").should("be.visible");
    cy.contains("Accédez à votre espace administrateur").should("be.visible");

    cy.get('input#email').should("exist");
    cy.get('input#password').should("exist");

    cy.contains("Se souvenir de moi").should("be.visible");
    cy.contains("Mot de passe oublié ?").should("be.visible");
    cy.contains("Se connecter").should("be.visible");
  });

  it("redirige vers /admin/home après une connexion fictive", () => {
    cy.visit("/admin/login");

    cy.get("#email").type("admin@example.com");
    cy.get("#password").type("password123");

    cy.contains("Se connecter").click();

    cy.url().should("include", "/admin/home");
    cy.contains("Mes boutiques").should("be.visible");
    cy.contains("Gérez et créez vos boutiques e-commerce").should("be.visible");
  });

  it("permet d'accéder à la page d'abonnement depuis le lien 'Créer un compte'", () => {
    cy.visit("/admin/login");

    cy.contains("Créer un compte").click();

    cy.url().should("include", "/subscribe");
  });

  it("permet de revenir à la home depuis le bouton 'Retour à l’accueil'", () => {
    cy.visit("/admin/login");

    cy.contains("Retour à l’accueil").click();
    
    cy.contains("Créez votre boutique e-commerce en quelques clics").should("be.visible");
    cy.contains("Commencer gratuitement").should("be.visible");
  });

});
