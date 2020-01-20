# Alessandro Pistola - 285802
## MyTimetable - status

[![GitHub license](https://img.shields.io/github/license/alepistola/MyTimetable)](https://raw.githubusercontent.com/alepistola/MyTimetable/master/LICENSE)
[![GitHub repo size](https://img.shields.io/github/repo-size/alepistola/MyTimetable)](https://github.com/alepistola/MyTimetable-client)
[![Website status](https://img.shields.io/website?down_color=red&down_message=offline&up_color=green&up_message=online&url=https%3A%2F%2Fmytimetable-client.herokuapp.com%2F)](https://mytimetable-client.herokuapp.com/)
[![Github issues](https://img.shields.io/github/issues/alepistola/MyTimetable)](https://github.com/alepistola/MyTimetable/issues)

## Breve descrizione del progetto
MyTimetable è una semplice API che consente di gestire il proprio orario universitario ed i relativi esami.

### Struttura del progetto
[![pdgt.png](https://i.postimg.cc/fk4LFN3x/pdgt.png)](https://postimg.cc/FkZNdwVR)

### Database SqlLite3
Per garantire la persistenza dei dati si è scelto di utilizzare una database sqlite3 essendo un'opzione prevista da glitch. Di seguito è riportato le schema concettuale del db utilizzato. 

Ad ogni avvio, il server controlla che il database esista, in caso negativo provvede a crearlo, le istruzioni sql utilizzate sono presenti all'interno del file create.sql.

### Servizio Web con API HTTP ([Glitch - API](https://wobbly-earwig.glitch.me/))
Il servizio web è interamente hostato sul sistema di *Continuous Delivery* glitch.com.


L'API raggiungibile dal link nel titolo è composta da 4 endpoint:
1. utenti : raggiungibile da 2 richieste get (una generale ed una per lo specifico utente *utenti/{username}*) per la visualizzazione e da richieste POST - PUT - DELETE per inserire, modificare, eliminare una determinata istanza.
2. corsi: raggiungibile da 2 richieste get (una generale ed una per lo specifico corso *corsi/{codice}*) per la visualizzazione e da richieste POST - PUT - DELETE per inserire, modificare, eliminare una determinata istanza.
3. orari: raggiungibile da 2 richieste get (una generale ed una per lo specifico orario *orari/{codice}*) per la visualizzazione e da richieste POST - PUT - DELETE per inserire, modificare, eliminare una determinata istanza.
4. frequentare: raggiungibile da richieste GET - POST - PUT - DELETE specificando l'username dell'utente. Tutte le richieste prevedo l'autenticazione dell'utente attraverso l'autenticazione *basic access* fornita dal protocollo http.
Tutti i dati ricevuti dal server tramite le richieste POST e PUT sono in formato json, viene utilizzata la chiave (specificata inline nell'url) per distinguere le diverse istanze mentre tutti gli altri dati devono essere inviati nel body della richiesta.
Tutti i dati richiesti al server, tramite le richieste GET, vengono inviati dal server in formato json.


Cercando di rispettare il paradigma RESTful, ogni risposta del server contiene il codice di stato HTTP e il tipo di contenuto (text/html oppure application/json) inoltre ogni connessione viene terminata dopo aver inviato la risposta, rispettando la proprietà *stateless* del protocollo http.

### openAPI e documentazione
Tutta l'API è stata documentata seguendo le specifiche openAPI. All'interno della repository è presente il file openapi.json che contiene lo schema dell'API creato seguendo le specifiche openAPI 3.0.1.

Lo schema è stato generato avvalendosi del toolkit Swagger (SwaggerEditor nello specifico). Così facendo è stato possibile utilizzare il pacchetto npm *swagger-ui-express* per generare una pagina web contenente tutta la documentazione dell'api. La pagina è raggiungibile al seguente [link](https://wobbly-earwig.glitch.me/api-docs/) e contiene anche esempi di richieste e risposte http per ogni endpoint.

### Client di esempio

### Scelta della licenza
Particolare attenzione è stata rivolta alla scelta della licenza. Avendo utilizzato nello sviluppo del client applicativo un template disponibile online ([SB-admin 2](https://blackrockdigital.github.io/startbootstrap-sb-admin-2/)) con licenza MIT, si è deciso di estenderla a tutto il progetto in quanto semplice e permissiva. Ovviamente nella licenza del file è stato aggiunto il riferimento alla licenza del tema utilizzato. Per scegliere la licenza più adeguata ed avere una visione generale sulle licenze adottabili è stato utilizzato il sito web [choosealicense](https://choosealicense.com/)
