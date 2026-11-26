const illustration = new URL("./icon.svg", import.meta.url).href;

function label(entity, top) {
  return {
    type: "state-label",
    entity,
    style: {
      top,
      left: "5%",
      transform: "translateY(-50%)",
      color: "white",
      "background-color": "rgba(0, 0, 0, 0.75)",
      padding: "6px 12px",
      "border-radius": "16px",
    },
    tap_action: { action: "more-info" },
  };
}

function tile(entity, name, feature) {
  return entity && {
    type: "tile", entity, name,
    ...(feature && { features: [{ type: feature }] }),
  };
}

function stoveConfig(entities, image) {
  return {
    type: "vertical-stack",
    cards: [
      {
        type: "picture-elements",
        image: image || illustration,
        elements: [
          entities.status && label(entities.status, "16%"),
          entities.air_temperature && label(entities.air_temperature, "84%"),
        ].filter(Boolean),
      },
      tile(entities.stove_switch, "Stufa"),
      tile(entities.set_power, "Potenza", "numeric-input"),
      tile(entities.set_air_temp, "Setpoint", "numeric-input"),
      tile(entities.flue_temperature, "Temperatura fumi"),
      tile(entities.water_temperature, "Temperatura acqua"),
      tile(entities.set_water_temp, "Setpoint acqua", "numeric-input"),
    ].filter(Boolean),
  };
}

class WiNetStoveCard extends HTMLElement {
  static getStubConfig() {
    return { type: "custom:winet-stove-card" };
  }

  static getConfigElement() {
    return document.createElement("winet-stove-card-editor");
  }

  setConfig(config) {
    this.config = config;
    this.child = undefined;
    this.replaceChildren();
    this.load();
  }

  set hass(hass) {
    this.homeAssistant = hass;
    if (this.child) this.child.hass = hass;
    else this.load();
  }

  async load() {
    const config = this.config;
    const hass = this.homeAssistant;
    if (!config || !hass || this.loading === config) return;
    this.loading = config;

    try {
      const [stoves, helpers] = await Promise.all([
        hass.callWS({ type: "winet/stoves" }),
        window.loadCardHelpers(),
      ]);
      if (this.config !== config) return;
      const stove = config.stove ? stoves.find(({ id }) => id === config.stove) : stoves[0];
      if (!stove) {
        this.textContent = "Nessuna stufa WiNet disponibile.";
        return;
      }
      this.child = helpers.createCardElement(stoveConfig(stove.entities, config.image));
      this.child.hass = this.homeAssistant;
      this.replaceChildren(this.child);
    } catch (error) {
      if (this.config === config) this.textContent = "Impossibile caricare la card WiNet.";
    }
  }

  getCardSize() {
    return this.child?.getCardSize?.() ?? 6;
  }
}

class WiNetStoveCardEditor extends HTMLElement {
  constructor() {
    super();
    this.select = document.createElement("select");
    this.select.setAttribute("aria-label", "Stufa WiNet");
    this.select.addEventListener("change", () => this.update({ stove: this.select.value }));
    const label = document.createElement("label");
    label.append("Stufa WiNet ", this.select);

    this.image = document.createElement("input");
    this.image.type = "text";
    this.image.placeholder = "/local/stufa.jpg";
    this.image.addEventListener("change", () => this.update({ image: this.image.value.trim() }));
    const imageLabel = document.createElement("label");
    imageLabel.append("Immagine (facoltativa) ", this.image);
    const fields = document.createElement("div");
    fields.style.cssText = "display:grid;gap:12px;padding:12px";
    fields.append(label, imageLabel);
    this.append(fields);
  }

  update(changes) {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: { ...this.config, ...changes } },
      bubbles: true,
      composed: true,
    }));
  }

  setConfig(config) {
    this.config = config;
    this.image.value = config.image || "";
    if (this.stoves) this.select.value = config.stove || this.stoves[0]?.id || "";
  }

  set hass(hass) {
    if (this.connection === hass.connection) return;
    this.connection = hass.connection;
    hass.callWS({ type: "winet/stoves" }).then((stoves) => {
      this.stoves = stoves;
      this.select.replaceChildren(...stoves.map(({ id, name }) => new Option(name, id)));
      this.select.value = this.config?.stove || stoves[0]?.id || "";
    }).catch(() => {
      this.select.replaceChildren(new Option("Stufe WiNet non disponibili", ""));
    });
  }
}

customElements.define("winet-stove-card", WiNetStoveCard);
customElements.define("winet-stove-card-editor", WiNetStoveCardEditor);
window.customCards ??= [];
window.customCards.push({
  type: "winet-stove-card",
  name: "WiNet · Stufa a pellet",
  description: "Stato, temperature e comandi della stufa WiNet.",
  preview: true,
});
