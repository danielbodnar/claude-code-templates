---
name: claude-code-exec
description: Use when the user asks to run automated code analysis, refactoring, or editing workflows using Claude Code's built-in capabilities. Covers task execution, plan mode, and session management.
---

# Claude Code Execution Skill Guide

## Running a Task
1. Assess the complexity and select the appropriate approach:
   - **Simple tasks**: Execute directly with tool calls
   - **Complex tasks**: Use plan mode to break down the work
   - **Multi-file refactoring**: Use subagents for parallel execution
2. Select the permission level required for the task:
   - Read-only analysis: Only use Read, Grep, Glob tools
   - Local edits: Use Edit, Write tools (requires approval)
   - Shell commands: Use Bash tool (requires approval per command or allowlist)
3. Always verify changes after making them — run tests, check types, and validate the output.
4. After completing, summarize what was done and suggest follow-up actions.

### Quick Reference
| Use case | Approach | Key tools |
| --- | --- | --- |
| Read-only review or analysis | Direct execution | Read, Grep, Glob, Bash (read-only commands) |
| Apply local edits | Direct execution with approval | Edit, Write, Bash |
| Complex multi-step work | Plan mode | All tools with structured plan |
| Parallel independent work | Subagents | Agent tool with multiple workers |
| Resume previous work | Continue from context | Check git status, read plan files |

## Model Options

Claude Code supports multiple models via the `/model` command:

| Model | Best for | Key features |
| --- | --- | --- |
| `claude-opus-4-7` | Complex reasoning, architecture, deep analysis | 1M context, strongest reasoning |
| `claude-sonnet-4-6` | Balanced performance and speed | Fast, high quality |
| `claude-haiku-4-5` | Quick tasks, simple changes | Fastest, cost-efficient |

## Following Up
- After completing a task, check if the user wants to continue with related work.
- When resuming previous work, check `git status`, plan files, and task lists for context.
- Use `/review` to get a code review of changes before committing.

## Error Handling
- Stop and report failures when a command exits non-zero; diagnose before retrying.
- After 3 failed attempts at the same approach, stop and ask the user for direction.
- When output includes warnings or partial results, summarize them and suggest how to proceed.

## Configuration

Configure Claude Code behavior via `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(bun test *)"
    ]
  }
}
```

Use `/config` to adjust settings interactively, or `/model` to switch models.
