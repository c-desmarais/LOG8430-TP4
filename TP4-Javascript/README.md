Etape 1 : Installer mongodb

Etape 2: 
Une fois que mongo est toute bien installe (et dans votre path)

Voici des commandes utiles : 
Pour entrer dans le mongo CLI
```
mongo
```
Pour voir la liste des db
``` 
show dbs 
```
Pour utiliser la db que jai creer pour le tp
```
use db-tp4
```
Pour voir le fait quon a une collection nommee factures
```
show collections
```

Pour voir le contenu de la db
```
db.factures.find()
```


Pour partir le server:
```
cd server
```
```
npm install
```
```
npm start
```

(memes steps pour le client)

Il suffit dinteragir avec le client dans la console.

