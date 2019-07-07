// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/mytimetable.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(function(){
  if (!exists) {
    db.run('CREATE TABLE corsi(codice INTEGER NOT NULL UNIQUE, titolo TEXT NOT NULL, descrizione TEXT, cfu INTEGER NOT NULL, programma TEXT, codice_orario INTEGER NOT NULL, FOREIGN KEY (codice_orario) REFERENCES orari(codice), PRIMARY KEY (codice));');
    db.run('CREATE TABLE orari (codice INTEGER NOT NULL PRIMARY KEY, lunedi TEXT, martedi TEXT, mercoledi TEXT, giovedi TEXT, venerdi TEXT);');
    db.run('CREATE TABLE utenti(username TEXT NOT NULL UNIQUE PRIMARY KEY, nome TEXT NOT NULL, cognome TEXT NOT NULL, password VARCHAR(255) NOT NULL, corso_di_studio TEXT, FOREIGN KEY(id_studio) REFERENCES studi_psicologia(id));');
    db.run('CREATE TABLE frequentare (id INTEGER NOT NULL PRIMARY KEY UNIQUE, username TEXT NOT NULL, codice_corso INTEGER NOT NULL, aula TEXT,  FOREIGN KEY (username) REFERENCES utenti(username), FOREIGN KEY (codice_corso) REFERENCES corsi(codice), PRIMARY KEY (id));');

    console.log('New tables created!');
    
    // insert default dreams
    db.serialize(function() {
      db.run('INSERT INTO utenti (username, nome, cognome, password, corso_di_studio) VALUES ("alepistola", "Alessandro", "Pistola", "password", "Informatica applicata")');
    });
  }
  else {
    console.log('Database "mytimetable" ready to go!');
    db.each('select * from utenti', function(err, row) {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.send("MyTimetable basic API");
  //response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
// currently this is the only endpoint, ie. adding dreams won't update the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/utenti', function(request, response) {
  db.all('select * from utenti', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.get('/utenti/:username', function(request, response) {
  const user = '"' + request.params.username + '"';
  var sql = 'select * from utenti where username = ';
  var sql = sql + user;
  console.log(sql);
  db.get(sql, function(err, row) {
    response.statusCode = 200;
    response.send(JSON.stringify(row));
  });
});

app.post('/utenti', function(request, response) {
  var username = request.body.username;
  var nome = request.body.nome;
  var cognome = request.body.cognome;
  var password = request.body.password;
  var corso_di_studio = request.body.corsodistudio;
  var sql2 = 'INSERT INTO utenti (username, nome, cognome, password, corso_di_studio) VALUES ("'+ username + '", "'+ nome +'", "'+ cognome +'", "'+ password +'", "' + corso_di_studio + '")';
  console.log(sql2);
  db.run(), function(err) {
    if (err) {
      response.statusCode = 500;
      return console.log(err.message);
    }
    // get the last insert id
    response.statusCode = 201;
    console.log('A row has been inserted with rowid ${this.lastID}');
  };
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
