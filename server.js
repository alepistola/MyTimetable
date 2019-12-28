// server.js
// where your node app starts

// init project
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// init sqlite db
var fs = require("fs");
var dbFile = "./.data/mytimetable.db";
var exists = fs.existsSync(dbFile);
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(dbFile);

//sql-error
var sql_error = "Errore sql, riprovare";

// if ./.data/mytimetable.db does not exist, create it, otherwise print records to console
db.serialize(function() {
  if (!exists) {
    db.run(
      "CREATE TABLE corsi(codice INTEGER NOT NULL UNIQUE, titolo TEXT NOT NULL, descrizione TEXT, cfu INTEGER NOT NULL, programma TEXT, codice_orario INTEGER NOT NULL, FOREIGN KEY (codice_orario) REFERENCES orari(codice), PRIMARY KEY (codice));"
    );
    db.run(
      "CREATE TABLE orari (codice INTEGER NOT NULL PRIMARY KEY, lunedi TEXT, martedi TEXT, mercoledi TEXT, giovedi TEXT, venerdi TEXT);"
    );
    db.run(
      "CREATE TABLE utenti(username TEXT NOT NULL UNIQUE PRIMARY KEY, nome TEXT NOT NULL, cognome TEXT NOT NULL, password VARCHAR(255) NOT NULL, corso_di_studio TEXT, FOREIGN KEY(id_studio) REFERENCES studi_psicologia(id));"
    );
    db.run(
      "CREATE TABLE frequentare (id INTEGER NOT NULL PRIMARY KEY UNIQUE, username TEXT NOT NULL, codice_corso INTEGER NOT NULL, aula TEXT,  FOREIGN KEY (username) REFERENCES utenti(username), FOREIGN KEY (codice_corso) REFERENCES corsi(codice), PRIMARY KEY (id));"
    );

    console.log("New tables created!");

    // insert default user
    db.serialize(function() {
      db.run(
        'INSERT INTO utenti (username, nome, cognome, password, corso_di_studio) VALUES ("alepistola", "Alessandro", "Pistola", "password", "Informatica applicata")'
      );
    });
  } else {
    console.log('Database "mytimetable" ready to go!');
    db.each("select * from utenti", function(err, row) {
      if (row) {
        console.log("record:", row);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/api", function(request, response) {
  response.send("MyTimetable basic API");
  //response.sendFile(__dirname + '/views/index.html');
});

// endpoints list
// GESTIONE UTENTI
// get -> show user list
app.get("/api/utenti", function(request, response) {
  db.all("select * from utenti", function(err, rows) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
    }
    response.status(200).type('application/json');
    response.send(JSON.stringify(rows));
  });
});

// get -> show single user
app.get("/api/utenti/:username", function(request, response) {
  const user = '"' + request.params.username + '"';
  var sql = "select * from utenti where username = ";
  var sql = sql + user;
  console.log(sql);
  db.get(sql, function(err, row) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    response.status(200).type('application/json').send(JSON.stringify(row));
  });
});

// post -> insert
app.post("/api/utenti", function(request, response) {
  var username = request.body.username;
  var nome = request.body.nome;
  var cognome = request.body.cognome;
  var password = request.body.password;
  var corso_di_studio = request.body.corso_di_studio;
  var sql1 =
    "SELECT COUNT(username) FROM utenti WHERE username = " + username + ";";
  console.log(sql1);
  db.get(sql1, function(err, row) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    var num = row["COUNT(username)"];
    if (num == 0) {
      var sql2 =
        "INSERT INTO utenti (username, nome, cognome, password, corso_di_studio) VALUES (" +
        username +
        ", " +
        nome +
        ", " +
        cognome +
        ", " +
        password +
        ", " +
        corso_di_studio +
        ")";
      db.run(sql2, function(err) {
        if (err) {
          response
            .status(500)
            .type('html')
            .send(sql_error)
            .end();
          return console.log(err.message);
        }
        response.type('html').status(201).send("Aggiunto utente " + username).end();
        return console.log("Aggiunto utente " + username);
      });
    } else {
      err = "Esiste un altro utente con lo stesso username";
      response
        .status(409)
        .type('html')
        .send(err)
        .end();
    }
  });
});

// put -> update specific user
app.put("/api/utenti/:username", function(request, response) {
  const username = '"' + request.params.username + '"';
  var new_user = request.body.username;
  var nome = request.body.nome;
  var cognome = request.body.cognome;
  var password = request.body.password;
  var corso_di_studio = request.body.corso_di_studio;
  var sql3 = "SELECT username FROM utenti WHERE username = " + username + ";";
  if (username !== undefined) {
    console.log(
      "Ottenuta richiesta di modifica dell'account: " +
        username +
        "\nCon le seguenti nuove informazioni: username->" +
        new_user +
        ", nome->" +
        nome +
        ", cognome->" +
        cognome +
        ", password->" +
        password +
        ", corso di studio-> " +
        corso_di_studio
    );
    db.get(sql3, function(err) {
      if (err) {
        response
          .status(500)
          .type('html')
          .send(
            sql_error + "\n Probabilmente l'username specificato non esiste"
          )
          .end();
        return console.log(err.message);
      }
      var sql4 =
        "UPDATE utenti SET username=" +
        new_user +
        ", nome=" +
        nome +
        ", cognome=" +
        cognome +
        ", password=" +
        password +
        ", corso_di_studio=" +
        corso_di_studio +
        " WHERE username=" +
        username +
        ";";
      db.run(sql4, function(err) {
        if (err) {
          response
            .status(500)
            .type('html')
            .send(sql_error)
            .end();
          return console.log(sql4 + "\n" + err.message);
        }
        response.status(202).type('html').send("Operazione di aggiornamento utente: " + username + " eseguita con successo").end();
        return console.log("Operazione di aggiornamento eseguita con successo");
      });
    });
  } else {
    let err =
      "Username specificato non valido, controllare la sintassi della richiesta PUT";
    response
      .status(400)
      .type('html')
      .send(err)
      .end();
  }
});

app.delete("/api/utenti/:username", function(request, response) {
  const username = '"' + request.params.username + '"';
  var sql3 =
    "SELECT username, nome, cognome FROM utenti WHERE username = " +
    username +
    ";";
  if (username !== undefined) {
    db.get(sql3, function(err, row) {
      if (err) {
        console.log(
          "Ottenuta richiesta di rimozione dell'account: " +
            username +
            "inesistente"
        );
        let error = "L'account specificato nella richiesta è inesistente";
        response
          .status(404)
          .type('html')
          .send(error)
          .end();
        return console.log(err.message);
      }
      console.log(
        "Ottenuta richiesta di rimozione dell'account: " +
          username +
          " (" +
          row.nome +
          " " +
          row.cognome +
          ")"
      );
      var sql_del = "DELETE FROM utenti WHERE username =" + username;
      db.run(sql_del, function(err) {
        if (err) {
          response
            .status(500)
            .type('html')
            .send(sql_error)
            .end();
          return console.log(sql_del + "\n" + err.message);
        }
        response.status(200).type('html').send("Operazione di rimozione utente: " + username + " eseguita con successo").end();
        return console.log("Operazione di rimozione eseguita con successo");
      });
    });
  } else {
    let err =
      "Username specificato non valido, controllare la sintassi della richiesta DELETE";
    response
      .status(400)
      .type('html')
      .send(err)
      .end();
  }
});

// ENDPOINT GESTIONE CORSO
// get -> show courses list
app.get("/api/corsi", function(request, response) {
  db.all("select * from corsi", function(err, rows) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    response.status(200).type('application/json').send(JSON.stringify(rows));
  });
});

// get -> show single course
app.get("/api/corsi/:codice", function(request, response) {
  const codice = '"' + request.params.codice + '"';
  var sql = "select * from corsi where codice = ";
  var sql = sql + codice;
  console.log(sql);
  db.get(sql, function(err, row) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    response.status(200).type('application/json').send(JSON.stringify(row));
  });
});

// post -> insert
app.post("/api/corsi", function(request, response) {
  var codice = request.body.codice;
  var titolo = request.body.titolo;
  var descrizione = request.body.descrizione;
  var cfu = request.body.cfu;
  var programma = request.body.programma;
  var codice_orario = request.body.codice_orario;
  var sql1 = "SELECT COUNT(codice) FROM corsi WHERE codice = " + codice + ";";
  db.get(sql1, function(err, row) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    var num = row["COUNT(codice)"];
    if (num == 0) {
      var sql2 =
        "INSERT INTO corsi (codice, titolo, descrizione, cfu, programma, codice_orario) VALUES (" +
        codice +
        ", " +
        titolo +
        ", " +
        descrizione +
        ", " +
        cfu +
        ", " +
        programma +
        ", " +
        codice_orario +
        ")";
      console.log(sql2);
      db.run(sql2, function(err) {
        if (err) {
          response.status(500).type('html').send(sql_error).end();
          return console.log(err.message);
        }
        response.status(201).type('html').send("Aggiunto corso con codice: " + codice).end();
        return console.log("A course has been inserted with codice " + codice);
      });
    } else {
      err = "Esiste un altro corso con lo stesso codice";
      response
        .status(409)
        .type('html')
        .send(err)
        .end();
    }
  });
});

// put -> update specific course
app.put("/api/corsi/:codice", function(request, response) {
  const codice = '"' + request.params.codice + '"';
  var new_codice = request.body.new_codice;
  var titolo = request.body.titolo;
  var descrizione = request.body.descrizione;
  var cfu = request.body.cfu;
  var programma = request.body.programma;
  var codice_orario = request.body.codice_orario;
  var sql3 = "SELECT codice FROM corsi WHERE codice = " + codice + ";";
  if (codice !== undefined) {
    console.log(
      "Ottenuta richiesta di modifica del corso: " +
        codice +
        "\nCon le seguenti nuove informazioni: codice->" +
        new_codice +
        ", titolo->" +
        titolo +
        ", descrizione->" +
        descrizione +
        ", cfu->" +
        cfu +
        ", programma->" +
        programma +
        ", codice di orario-> " +
        codice_orario
    );
    db.get(sql3, function(err) {
      if (err) {
        response
          .status(500)
          .type('html')
          .send(sql_error + "\n Probabilmente il codice specificato non esiste")
          .end();
        return console.log(err.message);
      }
      var sql4 =
        "UPDATE corsi SET codice=" +
        new_codice +
        ", titolo=" +
        titolo +
        ", descrizione=" +
        descrizione +
        ", cfu=" +
        cfu +
        ", programma=" +
        programma +
        ", codice_orario=" +
        codice_orario +
        " WHERE codice=" +
        codice +
        ";";
      db.run(sql4, function(err) {
        if (err) {
          response
            .status(500)
            .type('html')
            .send(sql_error)
            .end();
          return console.log(err.message);
        }
        response.status(200).type('html').send("Operazione di modifica del corso: " + codice + " eseguita con successo").end();
        return console.log("Operazione eseguita con successo");
      });
    });
  } else {
    let err =
      "Codice specificato non valido o inesistente, controllare la sintassi della richiesta PUT";
    response
      .status(400)
      .type('html')
      .send(err)
      .end();
  }
});

app.delete("/api/corsi/:codice", function(request, response) {
  const codice = '"' + request.params.codice + '"';
  var sql_del =
    "SELECT codice, titolo FROM corsi WHERE codice = " + codice + ";";
  if (codice !== undefined) {
    db.get(sql_del, function(err, row) {
      if (err) {
        console.log(
          "Ottenuta richiesta di rimozione del corso con codice: " +
            codice +
            "inesistente"
        );
        let err =
          "Codice specificato inesistente, controllare la sintassi della richiesta DELETE";
        response
          .status(404)
          .type('html')
          .send(err)
          .end();
        return console.log(err.message);
      }
      console.log(
        "Ottenuta richiesta di rimozione del corso: " +
          row.titolo +
          " (" +
          codice +
          ")"
      );
      var sql_del = "DELETE FROM corsi WHERE codice =" + codice;
      db.run(sql_del, function(err) {
        if (err) {
          response
            .status(500)
            .type('html')
            .send(sql_error)
            .end();
          return console.log(sql_del + "\n" + err.message);
        }
        response.status(200).type('html').send("Operazione di rimozione del corso: " + codice + " eseguita con successo").end();
        return console.log("Operazione di rimozione eseguita con successo");
      });
    });
  } else {
    let err =
      "Codice specificato non valido o inesistente, controllare la sintassi della richiesta DELETE";
    response
      .status(400)
      .type('html')
      .send(err)
      .end();
  }
});

// ENDPOINT GESTIONE ORARIO
// get -> show time list
app.get("/api/orari", function(request, response) {
  db.all("select * from orari", function(err, rows) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    response.status(200).type('application/json').send(JSON.stringify(rows));
  });
});

// get -> show single time
app.get("/api/orari/:codice", function(request, response) {
  const codice = '"' + request.params.codice + '"';
  var sql = "select * from orari where codice = ";
  var sql = sql + codice;
  console.log(sql);
  db.get(sql, function(err, row) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    response.status(200).type('application/json').send(JSON.stringify(row));
  });
});

// post -> insert
app.post("/api/orari", function(request, response) {
  var codice = request.body.codice;
  var lunedi = request.body.lunedi;
  var martedi = request.body.martedi;
  var mercoledi = request.body.mercoledi;
  var giovedi = request.body.giovedi;
  var venerdi = request.body.venerdi;
  var sql1 = "SELECT COUNT(codice) FROM orari WHERE codice = " + codice + ";";
  db.get(sql1, function(err, row) {
    if (err) {
      response
        .status(500)
        .type('html')
        .send(sql_error)
        .end();
      return console.log(err.message);
    }
    var num = row["COUNT(codice)"];
    if (num == 0) {
      var sql2 =
        "INSERT INTO orari (codice, lunedi, martedi, mercoledi, giovedi, venerdi) VALUES (" +
        codice +
        ", " +
        lunedi +
        ", " +
        martedi +
        ", " +
        mercoledi +
        ", " +
        giovedi +
        ", " +
        venerdi +
        ")";
      console.log(sql2);
      db.run(sql2, function(err) {
        if (err) {
          response.status(500).type('html').send(sql_error + "\n Probabilmente il codice specificato già esiste").end();
          return console.log(err.message);
        }
        response.status(201).type('html').send("Inserito orario con codice: " + codice).end();
        return console.log("Inserito orario con codice " + codice);
      });
    } else {
      err = "Esiste un altro orario con lo stesso codice";
      response
        .status(409)
        .type('html')
        .send(err)
        .end();
    }
  });
});

// put -> update specific time
app.put("/api/orari/:codice", function(request, response) {
  const codice = '"' + request.params.codice + '"';
  var new_codice = request.body.new_codice;
  var lunedi = request.body.lunedi;
  var martedi = request.body.martedi;
  var mercoledi = request.body.mercoledi;
  var giovedi = request.body.giovedi;
  var venerdi = request.body.venerdi;
  var sql3 = "SELECT codice FROM orari WHERE codice = " + codice + ";";
  if (codice !== undefined) {
    console.log(
      "Ottenuta richiesta di modifica dell'orario con codice: " + codice
    );
    db.get(sql3, function(err) {
      if (err) {
        response.status(500).type('html').send(sql_error + "\n Probabilmente non esiste nessun orario con il codice: " + codice).end();
        return console.log(err.message);
      }
      var sql4 =
        "UPDATE orari SET codice=" +
        new_codice +
        ", lunedi=" +
        lunedi +
        ", martedi=" +
        martedi +
        ", mercoledi=" +
        mercoledi +
        ", giovedi=" +
        giovedi +
        ", venerdi=" +
        venerdi +
        " WHERE codice=" +
        codice +
        ";";
      db.run(sql4, function(err) {
        if (err) {
          response.status(500).type('html').send(sql_error).end();
          return console.log(sql4 + "\n" + err.message);
        }
        response.status(202).type('html').send("Operazione di aggiornamento dell'orario : " + codice + " eseguita con successo").end();
        return console.log("Operazione di aggiornamento eseguita con successo");
      });
    });
  } else {
      let err =
      "Codice specificato non valido o inesistente, controllare la sintassi della richiesta GET";
      response
        .status(400)
        .type('html')
        .send(err)
        .end();  
  }
});

app.delete("/api/orari/:codice", function(request, response) {
  const codice = '"' + request.params.codice + '"';
  var sql_del = "SELECT codice FROM orari WHERE codice = " + codice + ";";
  if (codice !== undefined) {
    db.get(sql_del, function(err, row) {
      if (err) {
        console.log(
          "Ottenuta richiesta di rimozione dell'orario con codice: " +
            codice +
            "inesistente"
        );
        response.status(404).type('html').send("Codice specificato invalido o inesistente").end();
        return console.log(err.message);
      }
      console.log(
        "Ottenuta richiesta di rimozione dell'orario con codice: " + codice
      );
      var sql_del = "DELETE FROM orari WHERE codice =" + codice;
      db.run(sql_del, function(err) {
        if (err) {
          response.status(500).type('html').send(sql_error).end();
          return console.log(sql_del + "\n" + err.message);
        }
        response.status(202).type('html').send("Operazione di rimozione dell'orario: " + codice + " eseguita con successo").end();
        return console.log("Operazione di rimozione eseguita con successo");
      });
    });
  } else {
    let err =
      "Codice specificato non valido o inesistente, controllare la sintassi della richiesta DELETE";
    response
      .status(400)
      .type('html')
      .send(err)
      .end();  
  }
});

// ENDPOINT frequentare
// get -> show list of associations belong to specific user
app.get("/api/frequentare/:username", function(req, res) {
  const username = req.params.username;
  var passwd = "";
  // recupero la relativa password
  if (username !== null) {
    var sql =
      "SELECT password FROM utenti WHERE username=" + "'" + username + "'";
    db.get(sql, function(err, row) {
      if (err) {
        console.log(
          "Ottenuta richiesta con username: " + username + "inesistente"
        );
        res.status(404).type('html').send(sql_error + "\nUsername: " + username + " non esistente").end();
        return console.log(err.message);
      }
      passwd = row.password;
      console.log(
        "Ottenuta richiesta di visualizzazione da parte di: " + username
      );
      // richiedo autorizzazione
      var auth = req.headers["authorization"];
      if (auth) {
        var creds = auth.split(" ")[1];
        var decoded = new Buffer(creds, "base64").toString();
        const [login, password] = decoded.split(":");
        if (login == username && password == passwd) {
          // ottengo i risultati
          let sql2 =
            "SELECT * FROM frequentare WHERE username = " + "'" + login + "'";
          db.all(sql2, function(err, rows) {
            if (err) {
              res.status(404).type('html').send("Nessun riga presente per l'username: " + username).end();
              return console.log(err.message);
            }
            console.log(rows + " || " + sql2);
             return res
              .status(200)
              .type('application/json')
              .send(JSON.stringify(rows))
              .end();
          });
        }
      } else {
        res
          .status(401)
          .set("WWW-Authenticate", "Basic")
          .send("You need to authenticate in order to access this informations")
          .end();
      }
    });
  } else {
    res.status(400).type('html').send("Username specificato non valido, riprovare").end();
  }
});

// post -> create an association between user and course
// 1-Autentica l'utente
// 2-Controlla se esiste il corso
// 3-Effettua l'associazione

// using x-www-form-urlencoded !!
app.post("/api/frequentare/:username", function(req, res) {
  var passwd = "";
  const username = req.params.username;
  var codice_corso = req.body["codice_corso"];
  var aula = req.body["aula"];
  // recupero la relativa password
  if (username != null) {
    var sql =
      "SELECT password FROM utenti WHERE username=" + "'" + username + "'";
    db.get(sql, function(err, row) {
      if (err) {
        console.log(
          "Ottenuta richiesta con username: " + username + "inesistente"
        );
        res.status(404).type('html').send(sql_error + "\nProbabilme l'username: " + username + "non esiste").end();
        return console.log(err.message);
      }
      passwd = row.password;
      console.log(
        "Ottenuta richiesta di visualizzazione da parte di: " + username
      );
      // richiedo autorizzazione
      var auth = req.headers["authorization"];
      if (auth) {
        var creds = auth.split(" ")[1];
        var decoded = new Buffer(creds, "base64").toString();
        const [login, password] = decoded.split(":");
        if (login == username && password == passwd) {
          // controllo se esiste il codice del corso
          if (codice_corso != null) {
            let sql1 =
              "SELECT codice FROM corsi WHERE codice = " + codice_corso;
            db.get(sql1, function(err, row) {
              if (err) {
                console.log("Codice_corso: " + codice_corso + "inesistente");
                res
                  .status(500)
                  .type('html')
                  .send("Codice corso inesistente")
                  .end();
                return console.log(err.message);
              }
              // effettuo l'associazione
              if (aula != null) {
                let sql2 =
                  "INSERT INTO frequentare (username, codice_corso, aula) VALUES ('" +
                  username +
                  "', " +
                  codice_corso +
                  ", '" +
                  aula +
                  "')";
                console.log(sql2);
                db.run(sql2, function(err) {
                  if (err) {
                    res
                      .status(500)
                      .type('html')
                      .send("Errore nell'inserimento dell'associazione")
                      .end();
                    return console.log(err.message);
                  }
                  res
                    .status(201)
                    .type('html')
                    .send("Associazione dell'utente " + username + "inserita con successo")
                    .end();
                });
              }
            });
          } else
            res
              .status(404)
              .type('html')
              .send("Codice corso inesistente")
              .end();
        }
      } else {
        res
          .status(401)
          .set("WWW-Authenticate", "Basic")
          .send("You need to authenticate in order to access this info")
          .end();
      }
    });
  } else {
    res.status(400).type('html').send("Username: " + username + " non valido").end();
  }
});

// put -> update an association between user and course
// 1-Autentica l'utente
// 2-Controlla se esiste l'associazione
// 3-Effettua la modifica dell'associazione

// using x-www-form-urlencoded !!
app.put("/api/frequentare/:username", function(req, res) {
  var passwd = "";
  const username = req.params.username;
  var codice_corso = req.body["codice_corso"];
  var aula = req.body["aula"] != undefined ? req.body["aula"] : "";
  var id = req.body["id"];
  // recupero la relativa password
  if (username != null) {
    var sql =
      "SELECT password FROM utenti WHERE username=" + "'" + username + "'";
    db.get(sql, function(err, row) {
      if (err) {
        console.log(
          "Ottenuta richiesta con username: " + username + "inesistente"
        );
        res.status(404).type('html').send("Username: " + username + " inesistente").end();
        return console.log(err.message);
      }
      passwd = row.password;
      console.log(
        "Ottenuta richiesta di visualizzazione da parte di: " + username
      );
      // richiedo autorizzazione
      var auth = req.headers["authorization"];
      if (auth) {
        var creds = auth.split(" ")[1];
        var decoded = new Buffer(creds, "base64").toString();
        const [login, password] = decoded.split(":");
        if (login == username && password == passwd) {
          // controllo se esiste l'associazione
          if (id != null) {
            let sql1 = "SELECT id FROM frequentare WHERE id = " + id;
            db.get(sql1, function(err, row) {
              if (err) {
                console.log("Id associazione: " + id + "inesistente");
                res
                  .status(500)
                  .type('html')
                  .send(sql_error + "Id associazione inesistente")
                  .end();
                return console.log(err.message);
              }
              // controllo se esiste il nuovo corso
              if (codice_corso != null) {
                let sql1 =
                  "SELECT codice FROM corsi WHERE codice = " + codice_corso;
                db.get(sql1, function(err, row) {
                  if (err) {
                    console.log(
                      "Codice_corso: " + codice_corso + "inesistente"
                    );
                    res
                      .status(500)
                      .type('html')
                      .send("Codice corso inesistente")
                      .end();
                    return console.log(err.message);
                  }
                  // effettuo l'update
                  let sql2 =
                    "UPDATE frequentare SET username='" +
                    username +
                    "', codice_corso=" +
                    codice_corso +
                    ", aula=" +
                    aula +
                    " WHERE id =" +
                    id;
                  console.log(sql2);
                  db.run(sql2, function(err) {
                    if (err) {
                      res.status(500).type('html').send(sql_error).end();
                      return console.log(err.message);
                    }
                    res
                      .status(202)
                      .type('html')
                      .send("Operazione di aggiornamento associazione: " + id + " eseguita con successo")
                      .end();
                    return console.log(
                      "Operazione di aggiornamento eseguita con successo"
                    );
                  });
                });
              } else {
                res
                  .status(404)
                  .type('html')
                  .send("Il nuovo codice :" + codice_corso + "è invalido")
                  .end();
                return console.log(err.message);
              }
            });
          } else
            res
              .status(404)
              .type('html')
              .send("Id associazione inesistente")
              .end();
        }
      } else {
        res
          .status(401)
          .set("WWW-Authenticate", "Basic")
          .send("You need to authenticate in order to access this info")
          .end();
      }
    });
  } else {
    res.status(400).type('html').send("Username specificato non valido").end();
  }
});

// ENDPOINT frequentare
// delete -> delete specific association
app.delete("/api/frequentare/:username", function(req, res) {
  const username = req.params.username;
  const id = req.body["id"];
  var passwd = "";
  // recupero la relativa password
  if (username != null) {
    var sql =
      "SELECT password FROM utenti WHERE username=" + "'" + username + "'";
    db.get(sql, function(err, row) {
      if (err) {
        console.log(
          "Ottenuta richiesta con username: " + username + "inesistente"
        );
        res.status(404).type('html').send(sql_error + "\nProbabilmente l'username: " + username + " è inesistente").end();
        return console.log(err.message);
      }
      passwd = row.password;
      console.log(
        "Ottenuta richiesta di visualizzazione da parte di: " + username
      );
      // richiedo autorizzazione
      var auth = req.headers["authorization"];
      if (auth) {
        var creds = auth.split(" ")[1];
        var decoded = new Buffer(creds, "base64").toString();
        const [login, password] = decoded.split(":");
        if (login == username && password == passwd) {
          // controllo se esiste l'associazione
          let sql1 = "SELECT id FROM frequentare WHERE id = " + id;
          db.get(sql1, function(err, row) {
            if (err) {
              console.log("Id associazione: " + id + "inesistente");
              res
                .status(500)
                .type('html')
                .send("Id associazione inesistente")
                .end();
              return console.log(err.message);
            }
            // id esistente -> elimino
            let sql2 = "DELETE FROM frequentare WHERE id =" + id;
            db.run(sql2, function(err) {
              if (err) {
                res.status(500).type('html').send(sql_error).end();
                return console.log(err.message);
              }
              res
                .status(202)
                .type('html')
                .send("Operazione di elimina eseguita con successo")
                .end();
              return console.log("Operazione di elimina eseguita con successo");
            });
          });
        }
      } else {
        res
          .status(401)
          .set("WWW-Authenticate", "Basic")
          .send("You need to authenticate in order to access this info")
          .end();
      }
    });
  } else {
    res.status(400).type('html').send("Username specificato non valido").end();
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
