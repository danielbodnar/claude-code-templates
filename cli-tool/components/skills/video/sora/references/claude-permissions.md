# Claude Code permission notes

This guidance is intentionally isolated from `SKILL.md` because it can vary by environment and may become stale. Prefer the defaults in your environment when in doubt.

## Why am I asked to approve every video generation call?
Video generation uses the OpenAI Video API, so the CLI needs outbound network access. In Claude Code, Bash commands require approval by default, and the permission system may prompt for confirmation before networked commands run.

## How do I reduce repeated approval prompts?
If you trust the repo and want fewer prompts, add the relevant commands to your project or user settings allowlist.

Example `.claude/settings.json` pattern:

```json
{
  "permissions": {
    "allow": [
      "Bash(python *sora.py*)",
      "Bash(uv run --with openai *)"
    ]
  }
}
```

Or approve once during a session and select "Always allow" when prompted.

## Safety note
Use caution: pre-approving commands reduces friction but increases risk if you run untrusted code or work in an untrusted repository.
