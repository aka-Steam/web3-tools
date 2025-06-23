describe('Web3 performance real wallet (MetaMask, Sepolia)', () => {
  before(() => {
    cy.task('clearMetamaskData');
  });

  it('should measure cold start and sign for ethers.js', () => {
    cy.visit('/');
    cy.get('.tab').contains('Ethers.js').click();
    cy.get('.reset-btn').click();
    cy.wait(500);
    cy.get('.btn.cold').click();
    cy.acceptMetamaskAccess();
    cy.wait(1000);
    cy.get('.btn.sign').click();
    cy.confirmMetamaskSignatureRequest();
    cy.wait(1000);
    cy.get('.metric').contains('Холодное подключение:').parent().find('p').invoke('text').then(time => {
      cy.log('ethers.js cold start:', time);
    });
    cy.get('.metric').contains('Подпись транзакции:').parent().find('p').invoke('text').then(time => {
      cy.log('ethers.js sign:', time);
    });
  });

  it('should measure cold start and sign for viem', () => {
    cy.visit('/');
    cy.get('.tab').contains('Viem').click();
    cy.get('.reset-btn').click();
    cy.wait(500);
    cy.get('.btn.cold').click();
    cy.acceptMetamaskAccess();
    cy.wait(1000);
    cy.get('.btn.sign').click();
    cy.confirmMetamaskSignatureRequest();
    cy.wait(1000);
    cy.get('.metric').contains('Холодное подключение:').parent().find('p').invoke('text').then(time => {
      cy.log('viem cold start:', time);
    });
    cy.get('.metric').contains('Подпись транзакции:').parent().find('p').invoke('text').then(time => {
      cy.log('viem sign:', time);
    });
  });
}); 