# Hotmart MCP bridge

Personal Railway bridge for Hotmart MCP. The Hotmart credential is read only
from the Railway secret `HOTMART_TOKEN`; it is never committed to this repo.

Required variables:

- `HOTMART_TOKEN`: the token created for MCP Hotmart, without the `Basic ` prefix.
- `MCP_PATH_SECRET`: a long random URL secret used because ChatGPT's custom MCP form does not support arbitrary headers.

The public MCP URL is `https://<railway-domain>/mcp/<MCP_PATH_SECRET>` and is
configured in ChatGPT as **Sin autenticación**. Anyone who obtains that URL can
use the bridge, so rotate the path secret if it is exposed.
