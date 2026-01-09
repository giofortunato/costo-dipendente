# Simulatore Costo Dipendente - CCNL Commercio

Applicazione web per simulare il costo aziendale di un dipendente e il suo netto in busta, basato sul CCNL Commercio e Terziario.

## Funzionalità

- Calcolo costo totale azienda (contributi INPS, INAIL, TFR, fondi, ecc.)
- Calcolo netto in busta dipendente (IRPEF, detrazioni, addizionali)
- Supporto per tutti i livelli contrattuali (da 7° a Quadro)
- Gestione part-time con percentuale personalizzabile
- Scatti di anzianità
- Differenziazione per area geografica

## Deploy su GitHub Pages

### 1. Crea un nuovo repository su GitHub

Vai su [github.com/new](https://github.com/new) e crea un repository chiamato `costo-dipendente`

### 2. Modifica il package.json

Apri `package.json` e sostituisci `USERNAME` con il tuo username GitHub:

```json
"homepage": "https://TUO-USERNAME.github.io/costo-dipendente"
```

### 3. Inizializza e pusha il progetto

```bash
cd costo-dipendente-app
npm install
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/costo-dipendente.git
git push -u origin main
```

### 4. Esegui il deploy

```bash
npm run deploy
```

### 5. Abilita GitHub Pages

- Vai nelle Settings del repository
- Sezione "Pages"
- In "Source" seleziona il branch `gh-pages`
- Salva

La tua app sarà disponibile su: `https://TUO-USERNAME.github.io/costo-dipendente`

## Sviluppo locale

```bash
npm install
npm start
```

L'app sarà disponibile su `http://localhost:3000`

## Note

⚠️ Questa simulazione fornisce una stima indicativa. Per un calcolo preciso consultare un consulente del lavoro.
