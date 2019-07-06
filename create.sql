CREATE TABLE corsi(codice INTEGER NOT NULL UNIQUE, titolo TEXT NOT NULL, descrizione TEXT, cfu INTEGER NOT NULL, programma TEXT, codice_orario INTEGER NOT NULL, FOREIGN KEY (codice_orario) REFERENCES orari(codice), PRIMARY KEY (codice));

CREATE TABLE orari (codice INTEGER NOT NULL PRIMARY KEY , lunedi TEXT, martedi TEXT, mercoledi TEXT, giovedi TEXT, venerdi TEXT);

CREATE TABLE utenti(username TEXT NOT NULL UNIQUE PRIMARY KEY, nome TEXT NOT NULL, cognome TEXT NOT NULL, password TEXT NOT NULL, corso_di_studio TEXT);

CREATE TABLE frequentare (id INTEGER NOT NULL UNIQUE , username TEXT NOT NULL, codice_corso INTEGER NOT NULL, aula TEXT,  FOREIGN KEY (username) REFERENCES utenti(username), FOREIGN KEY (codice_corso) REFERENCES corsi(codice), PRIMARY KEY (id));
