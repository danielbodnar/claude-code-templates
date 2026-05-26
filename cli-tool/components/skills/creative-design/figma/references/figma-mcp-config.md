# Figma MCP config reference

Use this command to register the Figma MCP server in Claude Code:

```bash
claude mcp add figma --url https://mcp.figma.com/mcp
```

Or add it to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "figma": {
      "url": "https://mcp.figma.com/mcp",
      "env": {
        "FIGMA_OAUTH_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Notes and options
- The bearer token must be available as `FIGMA_OAUTH_TOKEN` in the environment that launches Claude Code.
- Keep the region header aligned with your Figma region. If your org uses another region, update `X-Figma-Region` consistently.
- MCP support is built into Claude Code — no additional feature flags needed.

## Env var setup (if missing)
- One-time set for current shell: `export FIGMA_OAUTH_TOKEN="<token>"`
- Persist for future sessions: add the export line to your shell profile (e.g., `~/.zshrc` or `~/.bashrc`), then restart the shell or your IDE.
- Verify before launching Claude Code: `echo $FIGMA_OAUTH_TOKEN` should print a non-empty token.

## Setup + verification checklist
- Run `claude mcp add figma --url https://mcp.figma.com/mcp` or add the config to `.claude/settings.json`.
- Restart Claude Code after updating config and env vars.
- Ask Claude Code to list Figma tools or run a simple call to confirm the server is reachable.

## Troubleshooting
- Token not picked up: Export `FIGMA_OAUTH_TOKEN` in the same shell that launches Claude Code, or add it to your shell profile and restart.
- OAuth errors: Verify the bearer token is valid. Tokens copied from Figma should not include surrounding quotes.
- Network/headers: Keep the `X-Figma-Region` header; if your org uses another region, update the header consistently.

## Usage reminders
- The server is link-based: copy the Figma frame or layer link, then ask the MCP client to implement that URL. The client will extract the node ID from the link (it does not browse the page).
- If output feels generic, restate the project-specific rules from the main skill and ensure you follow the required flow (get_design_context → get_metadata if needed → get_screenshot).
