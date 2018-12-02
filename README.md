# Tutoriel pour le TP 4 - LOG8430

## Arborescence de fichiers 
- **client** : application en console Node JS pour communiquer avec le serveur
- **server** : application en console NodeJS pour communiquer avec la base de données (MongoDB) et Spark
- **confSlave1**: premier esclave Spark
- **confSlave2**: deuxième esclave Spark
- **confMaster**: master Spark


## Étape 1 : Installations machines virtuelles (environnement virtual box)

Régler l'environnement sur Ubuntu Server 18.04 LTS

Il faut à priori créer 3 machines virtuelles pour les noeuds
Nous avons utilisé virtual box et créé un Nat Network afin que tous les
Noeuds soient sur le même réseau 192.168.15.0/24

Par sécurité, au cas où une erreur se glisserait dans la configuration réseau:
```
$ sudo systemctl disable systemd-networkd-wait-online.service
$ sudo systemctl mask systemd-networkd-wait-online.service
```
Changer le ficher /etc/hosts pour y mettre les addresses suivantes:

```
192.168.15.100	master
192.168.15.101	slave01
192.168.15.102	slave02
```

Ces adresses représentent la configuration de la grappe.

Installer les dépendances et requis :
```
$ sudo aptinstall software-properties-common
$ sudo add-apt-repository ppa:webupd8team/java
$ sudo apt update
$ sudo apt install oracle-java8-installer
$ sudo apt install scala
$ sudo apt install maven

```
Installer mongo
```
$ sudo apt install mongodb-server
$ sudo apt install mongodb-clients
```
Modifier la configuration pour que tous puissent y lire:
```
$ sudo nano /etc/mongodb.conf
```
Modifier cette ligne: 
```
- bind_ip = 127.0.0.1
+ bind_ip = 0.0.0.0
```

## Étape 2: Spark

Nous récupérons spark-2.3.2, et l'installons
```
$ wget http://apache.forsale.plus/spark/spark-2.3.2/spark-2.3.2-bin-hadoop2.7.tgz
$ sudo mkdir /usr/local/spark
$ sudo tar xvf spark-2.3.2-bin-hadoop2.7.tgz -C /usr/local/sparkls
$ sudo mv /usr/local/spark/spark-2.4.0-bin-hadoop2.7/* /usr/local/spark/.
$ sudo chown -R <nom-user> /usr/local/spark
$ sudo chmod -R u+w <nom-user> /usr/local/spark
```
Ajout des chemins à bashrc
```
$ nano ~/.bashrc
```
Ajouter ceci en bas
```
SPARK_HOME=/usr/local/spark
JAVA_HOME=/usr/lib/jvm/java-8-oracle
PATH="$SPARK_HOME/bin":$PATH
PATH="$JAVA_HOME/bin":$PATH
export PATH
export SPARK_LOCAL_IP=127.0.0.1
```
```
$ source ~/.bashrc
```

Le spark-shell est maintenant fonctionnel, il est possible de clôner la VM et d'en faire 2 slaves.


Modifier le fichier /etc/netplan/50-cloud-init.yaml pour régler les adresses ip statiques, soient respectivement
```
192.168.15.100	master
192.168.15.101	slave01
192.168.15.102	slave02
```

Exemple pour master/serveur:
```
network:
  ethernets:
    enp0s3:
      addresses: [192.168.15.100/24]
      gateway4: 192.168.15.1
      nameservers:
        addresses: [8.8.8.8,8.8.4.4]
      dhcp: np
    version: 2
```


Configuration de spark sur les noeuds

```
$ cd /usr/local/spark/conf

$ cp spark-env.sh.template spark-env.sh
$ nano spark-env.sh
```
Y mettre les valeurs suivantes (d'après le noeud)
```
Master:
SPARK_LOCAL_IP="master"
SPARK_MASTER_HOST="master"

Slave01:
SPARK_LOCAL_IP="slave01"
SPARK_MASTER_HOST="master"

Slave02:
SPARK_LOCAL_IP="slave02"
SPARK_MASTER_HOST="master"
```

```
$ cp spark-defaults.conf.template spark-defaults.conf
$ nano spark-defaults.conf

```


Y ajouter les valeurs suivantes
```
spark.mongodb.input.uri          mongodb://192.168.15.100:27017
spark.mongodb.input.database     db-tp4
spark.mongodb.input.collection   factures
```


Sur Master: régler le niveau de logs
```
$ cp log4j.properties.template log4j.properties
$ nano log4j.properties
```
Changer la ligne suivante
```
- log4j.rootCategory=INFO, console
+ log4j.rootCategory=ERROR, console
```


Sur Master: régler les slaves:
```
$ cp slaves-template slaves
$ nano slaves
```
Y mettre le contenu suivant
```
slave01
slave02
```


Régler les clés ssh

On génère une clé publique à master
```
$ ssh-keygen -t rsa -P ""
$ cd /home/master/.ssh
```
On enregistre la clé aux 3 noeuds (lui-même et les slaves)
```
$ sudo ssh-copy-id -i id_rsa.pub <nom_user>@<ip> (ex: master@192.168.15.100)
```
Installer les paquets pythons
```
$ sudo apt install python-pip
$ pip --no-cache-dir install pyspark
$ pip install numpy
$ pip install pymongo
```
Les slaves devraient être prêts à présent. La suite concerne uniquement le serveur/master

SERVER / MASTER


Activez le cluster
```
$ /usr/local/spark/sbin/start-all.sh
```
À ce moment, à partir d'un fureteur, il devrait être possible d'accéder à
http://192.169.15.100:8080 (soit, l'API Web de Spark)
On y voit deux workers en attente. Ce sont les slaves.



Récupérer le dépôt git : https://github.com/c-desmarais/LOG8430-TP4.git
Vous pouvez supprimer le dossier client.
server/test.py doit être copié dans le répertoire ~/


## Étape 3: Démarrage du serveur

```
Installation de nodejs et npm
```
$ sudo apt install nodejs
$ sudo apt install npm

Se rendre dans le chemin approprié à l'intérieur du dossier server:
```
cd server
```

Exécuter les commandes suivantes:
```
$ npm i child_process
```
```
npm install
```
```
npm start
```

## Étape 4: Démarrage du client

Pour utiliser le client, il faut installer nodejs et npm
```
$ sudo apt install nodejs
$ sudo apt install npm
```
Se rendre dans le chemin approprié à l'intérieur du dossier client:
```
cd client
```

Exécuter les commandes suivantes:
```
npm install
```
```
npm start
```

Il suffit dinteragir avec le client dans la console.

## Ressources
https://spark.apache.org/docs/latest/
https://spark.apache.org/docs/2.1.0/api/python/pyspark.sql.html
https://stackoverflow.com/questions/46814260/spark-mongodb-connector-scala-missing-database-name
https://medium.com/founding-ithaka/setting-up-and-connecting-to-a-remote-mongodb-database-5df754a4da89
https://stackoverflow.com/questions/38252121/how-to-use-pysparks-fp-growth-with-an-rdd
https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
https://docs.mongodb.com/spark-connector/
https://jaceklaskowski.gitbooks.io/mastering-apache-spark/spark-architecture.html
