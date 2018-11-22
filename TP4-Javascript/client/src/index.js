
var readline = require('readline')

function initializeClient() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const messageInitial = 'Bonjour et bienvenue sur le client. \n' +
    'Plusieurs options vous sont disponibles: \n' +
    '1 - Consulter la liste des factures \n' +
    '2 - Ajouter une facture. \n' +
    '3 - Consulter la liste des produits frequents (currently unavailable) \n' +
    'q - tapper la lettre q et Entree si vous desirez quitter a tout moment \n'

  rl.question(messageInitial, answer => {
    console.log('Vous avez choisi loption:', answer);
    if(answer == '1') {
      console.log('Liste des factures dans le service: ')
    } else if (answer == '2') {
      console.log('ajout dune facture')
    } else if (answer == '3') {
      console.log('Liste des produits frequents:')
    } else if (answer == 'q') {
      console.log('Merci et au revoir.')
    } else {
      console.log('Veuillez choisir une option valide (1,2,3 ou q)')
    }
    rl.close();
  })
}

initializeClient()