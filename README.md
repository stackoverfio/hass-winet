# 🔥 WiNet Stove – Home Assistant Integration

Integrazione non ufficiale, ancora in fase sperimentale, sviluppata e mantenuta dalla community.

Integrazione Home Assistant per stufe a pellet equipaggiate con modulo wi-fi smart **WiNet**
Supporta **connessione Locale e Cloud**.

---

## ✨ Funzionalità

- Accensione / Spegnimento stufa
- Impostazione potenza (1–5)
- Temperatura aria (step 0.5°C)
- Temperatura acqua (opzionale)
- Sensori:
  - Stato stufa
  - Temperatura aria
  - Temperatura fumi
  - RPM estrattore
- Scritture **debounced** (protezione memoria interna)
- Wizard di configurazione semplice

---

## 🔧 Installazione (HACS)

1. HACS → Integrazioni → **Custom repository**
2. URL: https://github.com/stackoverfio/winet-ha
3. Categoria: **Integration**
4. Installa **WiNet Stove**
5. Riavvia Home Assistant
6. Aggiungi integrazione da **Impostazioni → Dispositivi**

---

## 🧭 Configurazione

### Modalità Locale
- Inserisci IP della stufa (es. `192.168.1.50`)
- Seleziona se la stufa è **ad acqua**

### Modalità Cloud
- Inserisci `stove_id`

---

## Card per la dashboard

Dopo aver configurato WiNet, apri **Modifica dashboard → Aggiungi card** e cerca
**WiNet · Stufa a pellet**. La card si collega automaticamente alla prima stufa
disponibile e include un’illustrazione. Se hai più stufe, puoi selezionare quella
desiderata nell’editor. Nello stesso editor puoi specificare il percorso di una
foto già disponibile in Home Assistant.

La card viene caricata dall’integrazione e si aggiunge dalla dashboard. Non
serve incollare YAML, aggiungere risorse Lovelace o installare Mushroom.

## 🌡️ Note sulle temperature
Le stufe WiNet usano **mezzi gradi (0.5°C)**.  
L’integrazione converte automaticamente i valori.

---

## 🧑‍💻 Supporto
Questa è una integrazione **non ufficiale**.  
Segnalazioni e contributi sono benvenuti!

---

## 📜 Licenza
MIT

