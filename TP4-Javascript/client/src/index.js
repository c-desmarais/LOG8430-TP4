
let readline = require('readline')
let request = require('request-promise')
const baseUrl = 'http://127.0.0.1:8080'  

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Prend ce quil y a dans la console, fait un objet facture avec.
function creerFacture() {
  console.log('Ajout d\'une facture:')
  const messageAjoutItem = 'Veuillez copier le json representant les items a ajouter et leur prix \n' + 
  'Exemple : \{"shampoing": "2.22", "dentifrice": "3.33"}\ \n' 
  //TODO : il ny a aucune validation faite ici, on assume que tout est beau. Faudrait peut etre en ajouter une.
  return new Promise(resolve => rl.question(messageAjoutItem, answer => resolve(answer)))
}

// Envoie un objet facture (via le body) sur la route POST /factures
function ajouterFacture(facture) {
  const options = {
    method: 'POST',
    uri: `${baseUrl}/factures`,
    body: JSON.parse(facture),
    json: true
  }

  return request(options)
}

function initClient() {
  const messageInitial = 'Options disponibles: \n' +
    '1 - Consulter la liste des factures \n' +
    '2 - Ajouter une facture. \n' +
    '3 - Consulter la liste des produits frequents (currently unavailable) \n' +
    'q - tapper la lettre q et Entree si vous desirez quitter \n'

  rl.question(messageInitial, answer => {
    console.log('Vous avez choisi loption:', answer);
    if(answer == '1') {
      request(`${baseUrl}/factures`, (error, response, body) => {
        if (error) throw error
        console.log('----- Liste des factures dans le service -----')
        console.log(body) // Le body contient la liste des factures
        console.log('----------')
        initClient()
      })
    } else if (answer == '2') {
      // recuperer les items a ajouter dans la console
      creerFacture()
        .then(result => ajouterFacture(result))
        .then(response => {
          console.log(response)
          initClient()
        })
        .catch(err => {
          if (err instanceof SyntaxError) {
            console.log("Veuillez fournir un JSON valide lorsque vous ajouter une facture svp.")
            initClient()
          } else {
            console.log(err)
            //TODO : gerer les autres types derreurs
          }
        })
    } else if (answer == '3') {
      console.log('Liste des produits frequents:')
      initClient()
      // TODO : faire ca avec spark
    } else if (answer == 'q') {
      console.log('Merci et au revoir.')
      rl.close();
      process.exit()
    } else {
      console.log('Veuillez choisir une option valide (1,2,3 ou q)')
      initClient()
    }
  })
}

initClient()