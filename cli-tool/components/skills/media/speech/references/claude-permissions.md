# Claude Code permission notes

This guidance is intentionally isolated from `SKILL.md` because it can vary by environment and may become stale. Prefer the defaults in your environment when in doubt.

## Why am I asked to approve every speech generation call?
Speech generation uses the OpenAI Audio API, so the CLI needs outbound network access. In Claude Code, Bash commands require approval by default, and the permission system may prompt for confirmation before networked commands run.

## How do I reduce repeated approval prompts?
If you trust the repo and want fewer prompts, add the relevant commands to your project or user settings allowlist.

Example `.claude/settings.json` pattern:

```json
{
  "permissions": {
    "allow": [
      "Bash(python *text_to_speech.py*)",
      "Bash(uv run --with openai *)"
    ]
  }
}
```

Or approve once during a session and select "Always allow" when prompted.

## Safety note
Use caution: pre-approving commands reduces friction but increases risk if you run untrusted code or work in an untrusted repository.
