"""Register the WiNet card and provide its entity bindings."""

from pathlib import Path

import voluptuous as vol

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.auth.permissions.const import POLICY_READ
from homeassistant.core import callback
from homeassistant.helpers import entity_registry

from .const import DOMAIN

ASSET_URL = "/winet-card-assets"


async def async_setup_dashboard(hass):
    directory = Path(__file__).parent
    await hass.http.async_register_static_paths([
        StaticPathConfig(f"{ASSET_URL}/{name}", str(directory / name), False)
        for name in ("stove-card.js", "icon.svg")
    ])
    frontend.add_extra_js_url(hass, f"{ASSET_URL}/stove-card.js")
    websocket_api.async_register_command(hass, websocket_stoves)


@websocket_api.websocket_command({vol.Required("type"): "winet/stoves"})
@callback
def websocket_stoves(hass, connection, msg):
    registry = entity_registry.async_get(hass)
    stoves = []
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.entry_id not in hass.data.get(DOMAIN, {}):
            continue
        entities = {}
        for entity in entity_registry.async_entries_for_config_entry(
            registry, entry.entry_id
        ):
            if not entity.disabled and connection.user.permissions.check_entity(
                entity.entity_id, POLICY_READ
            ):
                key = entity.unique_id.removeprefix(f"{entry.entry_id}_")
                entities[key] = entity.entity_id
        if entities.get("stove_switch"):
            stoves.append({"id": entry.entry_id, "name": entry.title, "entities": entities})
    connection.send_result(msg["id"], stoves)
