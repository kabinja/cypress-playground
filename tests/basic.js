describe('Test Open Google', function () {
  it('Visit google page', function () {
    cy.visit('https://www.google.com/');
    cy.get('#L2AGLb').click();
  });
});
