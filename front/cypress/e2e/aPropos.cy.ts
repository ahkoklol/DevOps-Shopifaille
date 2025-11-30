/// <reference types="cypress" />

describe('Page APropos', () => {
  
  const shopId = 'shop-2'; 
  const url = `/shop/${shopId}/apropos`;

  it('Affiche la page APropos correctement', () => {
    cy.visit(url);

    cy.contains('h1', 'À propos de').should('be.visible');

    cy.get('div.text-6xl').should('exist');

    cy.contains('h2', 'Notre Histoire').should('be.visible');
    cy.get('img[alt="Notre histoire"]').should('be.visible');

    cy.contains('h2', 'Notre Mission').should('be.visible');

    cy.contains('div', 'Notre Mission')
      .parent()
      .parent()
      .find('.grid')
      .within(() => {
        cy.get('div').should('have.length.at.least', 1);
      });

    cy.contains('h2', 'Notre Équipe').should('be.visible');
    cy.get('img').should('exist');

    cy.get('a[target="_blank"]').should('exist');

    cy.contains('button', 'Voir le catalogue').should('be.visible');
  });

  it('Le bouton CTA redirige vers le catalogue', () => {
    cy.visit(url);

    cy.contains('button', 'Voir le catalogue').click();
    cy.url().should('include', `/shop/${shopId}/catalogue`);
  });

  it("Affiche 'Page non disponible' si le shop n'existe pas", () => {
    cy.visit('/shop/shop-qui-existe-pas/apropos');

    cy.contains('Page non disponible').should('be.visible');
    cy.contains('Les informations "À propos" ne sont pas encore configurées.').should('be.visible');
  });

});
