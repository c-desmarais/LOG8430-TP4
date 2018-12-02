let express = require('express')
let app = express()

let bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

let db

function initializeRoutes() {
  app.get('/', (req, res) => {
    res.send('Hello World')
  })
 
  app.get('/frequentproducts', (req, res) => {
    const { exec } = require('child_process');
    exec('/usr/local/spark/bin/spark-submit --master spark://192.168.15.100:7077 --packages org.mongodb.spark:mongo-spark-connector_2.11:2.3.1 ~/test.py', (err, stdout, stderr) => {
      if(err) {
	res.send('An Error has occured');
        return;
      }
    res.send(stdout)
  });
  })

  app.get('/factures', (req, res) => {
    db.collection('factures').find({}).toArray((err, factures) => {
      assert.equal(err, null);
      console.log("Liste des factures trouvees: \n")
      console.log(factures)
      res.send(factures)
    })
  })
 
  app.post('/factures', (req, res) => {
    const facture = req.body
    db.collection('factures').insertOne(facture, (err, res) => {
      if (err) throw err
      console.log('Une facture inseree.')
      console.log(facture)
    })
    res.send("Votre facture a etee ajoutee.")
  })
}

function initializeService(servicePort) {
  // First initialize the database
  let dbName="db-tp4"
  MongoClient.connect(`mongodb://localhost:27017/database-tp4`, { useNewUrlParser: true }, (err, database) => {
    if(err) throw err
  
    db = database.db(dbName)
    console.log("La connection avec la base de donnees est effecutee.")

    db.createCollection("factures", function(err, res) {
      if (err) throw err
      console.log("La collection facture est creee.")
    })
    
    app.use(bodyParser.json())

    initializeRoutes()
    app.listen(servicePort, () => {
      console.log(`Le serveur ecoute sur le port: ${servicePort}`)
    })
  })
}

initializeService(8008)
