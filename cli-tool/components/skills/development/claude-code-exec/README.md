# Claude Code Execution Skill

## Purpose
Structured workflows for automated code analysis, refactoring, and editing using Claude Code's built-in capabilities including plan mode, subagents, and tool orchestration.

## Prerequisites
- Claude Code CLI installed and available on `PATH`.
- Run `claude --version` to confirm installation.

## Installation

```bash
npx claude-code-templates@latest --skill development/claude-code-exec
```

## Usage

### Example Workflow

**User prompt:**
```
Analyze this repository and suggest improvements for the authentication module.
```

**Claude Code response:**
Claude will activate the skill and:
1. Scan the repository structure and identify auth-related files
2. Analyze the code for patterns, security issues, and improvement opportunities
3. Present a structured summary with prioritized suggestions
4. Ask if you'd like to implement any of the suggested changes

### Detailed Instructions
See `SKILL.md` for complete operational instructions and workflow guidance.
