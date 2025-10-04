# Oktober Orders (GitHub Pages + Firebase)

App web **pronta** per gestire le ordinazioni durante una sagra in stile Oktoberfest.
Funziona su **10 smartphone** e **1 PC** contemporaneamente, con **sincronizzazione in tempo reale** (Firebase).

## ✅ Funzioni
- Nome cameriere, numero tavolo
- Selezione bevande e quantità (con prezzi)
- Calcolo totale ordine
- Stati ordine: *In attesa → Pronto → Consegnato → Elimina*
- **Dashboard incassi** (incasso totale + conteggi per stato)
- Aggiornamento in tempo reale su tutti i dispositivi

## 🚀 Deploy su GitHub Pages
1. Carica questi file nel tuo repository (es. `oktober-order`).
2. Attiva **Settings → Pages → Branch: main / (root)**.
3. Apri il link pubblico generato da GitHub Pages.

## 🔑 Configurazione Firebase
Nel file **index.html** ho già inserito la tua configurazione Firebase:

```js
const firebaseConfig = {
  "apiKey": "AIzaSyAZPR5tHdHgbfdhq77SERUBBsH3o3GlFro",
  "authDomain": "oktoberfest-ordes.firebaseapp.com",
  "projectId": "oktoberfest-ordes",
  "storageBucket": "oktoberfest-ordes.firebasestorage.app",
  "messagingSenderId": "836780488125",
  "appId": "1:836780488125:web:a5d99be814b773c7f78ed4"
}
```

### Realtime Database
Nel pannello Firebase:
1. Vai su **Build → Realtime Database**.
2. Crea un database (Posizione: *europe-west* consigliata).
3. Nella tab **Regole**, per i test puoi usare **regole aperte** (ricordati di restringerle dopo l'evento):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> ⚠️ Le regole aperte rendono il database scrivibile da chiunque conosca l'URL. Usale solo per eventi brevi / test. Dopo l'evento, disattivale o restringi l'accesso.

## 🧭 Struttura dati
```
orders/
  <id>:
    waiter: "Luca"
    table: 12
    quantities: { bionda_05, bionda_1, rossa_05, rossa_1, nf_05, nf_1, cola, nat, frizz }
    items: ["Bionda 0,5L × 2", "Coca-Cola × 1"]
    total: 29
    status: "pending" | "ready" | "delivered"
    createdAt: 1730000000000
```

## 🧰 Personalizzazione prezzi / voci
Modifica l'oggetto `PRICE` all'inizio di **app.js**.

## 📱 Consigli d'uso alla sagra
- Fissa la pagina del browser a schermo intero sul PC di cucina.
- Condividi il link di GitHub Pages ai camerieri (rete 4G).
- Dai regole semplici su come passare gli stati **Pronto / Consegnato**.
- In caso di rete lenta, i dati restano nel cloud; ricaricando la pagina li ritrovi.

Buon lavoro e buona sagra! 🍻
