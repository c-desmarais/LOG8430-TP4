
let readline = require('readline')
let request = require('request-promise')
const baseUrl = 'http://127.0.0.1:8080'  

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ajoutNomItem() {
  return new Promise((resolve, reject) => {
    rl.question('Quel est le nom de l\'item : ', (name) => {
      if (name.match(/^[a-z0-9]+$/)) {
        return resolve(name)
      } else {
        return reject(new Error('Nom invalide: Veuillez vous assurer de fournir un nom tel que /^[a-z0-9]+$/)'))
      }
    })
  })
}

function ajoutPrixItem(name) {
  return new Promise((resolve, reject) => {
    rl.question('Quel est le prix de l\'item:', (price) => {
      if (price.match(/(\d+\.\d{1,2})/)) {
        return resolve({name, price})
      } else {
        return reject(new Error('Prix invalide : Veuillez vous assurer de fournir un prix tel que /^(\d{1,3})?(,?\d{3})*(\.\d{2})?$)/'))
      }
    })
  })
}

function continuerAjout(namePrice) {
  return new Promise((resolve, reject) => {
    rl.question('Voulez-vous continuer a ajouter des items (o pour oui, n pour non):', (continueAdding) => {
      if (continueAdding == 'o' || continueAdding == 'n') {
        return resolve([continueAdding, namePrice])
      } else {
        return reject(new Error('Continuer Ajout Invalide : Veuillez vous assurer de fournir o (pour oui) ou n (pour non)'))
      }
    })
  })
}

// Prend ce quil y a dans la console, fait un objet facture avec.
function creerFacture(factureArray) {

  return ajoutNomItem()
  .then(name => ajoutPrixItem(name))
  .then(namePrice => continuerAjout(namePrice))
  .then(response => {
    const itemToAdd = {
      name: response[1].name,
      price: response[1].price
    }

    factureArray.push(itemToAdd)

    if (response[0] == 'o') {
      return creerFacture(factureArray)
    } else {
      return new Promise(resolve => resolve({items: factureArray}))
    }
  })
  .catch(error => {
    console.log('Lerreur suivante est survenue pendant lajout de litem et il na pas ete ajoute: ')
    console.log(error.message)
    console.log('Veuillez reinserer votre item correctement.')
    return creerFacture(factureArray)
  })
}

// Envoie un objet facture (via le body) sur la route POST /factures
function ajouterFacture(facture) {
  const options = {
    method: 'POST',
    uri: `${baseUrl}/factures`,
    body: facture,
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
      let factureArray = []
      creerFacture(factureArray)
        .then(result => {
          console.log('Facture cree:')
          console.log(result)
          return ajouterFacture(result)
        })
        .then(response => {
          console.log(response)
          initClient()
        })
        .catch(err => {
          console.log(err.message)
          initClient()
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