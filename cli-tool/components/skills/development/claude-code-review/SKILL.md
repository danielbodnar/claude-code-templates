---
name: claude-code-review
description: Professional code review with auto CHANGELOG generation, integrated with Claude Code
---

# claude-code-review

## Overview
Professional code review with auto CHANGELOG generation, integrated with Claude Code

## When to Use
- When you want professional code review before commits
- When you need automatic CHANGELOG generation
- When reviewing large-scale refactoring

## Installation
```bash
npx claude-code-templates@latest --skill development/claude-code-review
```

## Step-by-Step Guide
1. Install the skill using the command above
2. Ensure Claude Code CLI is installed
3. Use `/code-review` or natural language triggers

## Examples
Use the `/review` command or ask Claude Code to review your changes before committing.

## Best Practices
- Keep CHANGELOG.md in your project root
- Use conventional commit messages

## Troubleshooting
Run `claude --version` to verify CLI installation.

## Related Skills
- context7-auto-research, tavily-web, exa-search, firecrawl-scraper
