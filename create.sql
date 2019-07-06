CREATE TABLE corsi(
    codice INT NOT NULL UNIQUE AUTO_INCREMENT,
    titolo VARCHAR(50) NOT NULL, 
    descrizione VARCHAR(255),
    cfu INT NOT NULL,
    programma VARCHAR(255),
    codice_orario INT NOT NULL,
    FOREIGN KEY (codice_orario) REFERENCES orari(codice),
    PRIMARY KEY (codice)
);

CREATE TABLE orari (
    codice INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    lunedi VARCHAR(50),
    martedi VARCHAR(50),
    mercoledi VARCHAR(50),
    giovedi VARCHAR(50),
    venerdi VARCHAR(50),    
);

CREATE TABLE utenti(
    username VARCHAR(50) NOT NULL UNIQUE PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    corso_di_studio VARCHAR(50),
    FOREIGN KEY(id_studio) REFERENCES studi_psicologia(id),
);

CREATE TABLE frequentare (
    id INT NOT NULL PRIMARY KEY UNIQUE AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    codice_corso INT NOT NULL,
    aula VARCHAR(50), 
    FOREIGN KEY (username) REFERENCES utenti(username),
    FOREIGN KEY (codice_corso) REFERENCES corsi(codice),
    PRIMARY KEY (id)
);
