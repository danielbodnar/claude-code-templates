# External Review Protocol

This step sends `claude-plan.md` to independent reviewers for analysis using Claude Code subagents.

## Overview

Launch TWO parallel subagents to get independent reviews:
1. **Architecture Reviewer** - Focuses on structural and performance concerns
2. **Security Reviewer** - Focuses on security, edge cases, and risk

Both reviewers receive the same plan and return their analysis.

## Review Prompt

Use this prompt for both reviewers:

```
You are a senior software architect reviewing an implementation plan.

The plan is self-contained - it includes all background, context, and requirements.

Identify:
- Potential footguns and edge cases
- Missing considerations
- Security vulnerabilities
- Performance issues
- Architectural problems
- Unclear or ambiguous requirements
- Anything else worth adding to the plan

Be specific and actionable. Reference specific sections. Give your honest, unconstrained assessment.

Here is the plan to review:

{PLAN_CONTENT}
```

## Execution

### Step 1: Read the Plan

```bash
plan_content=$(cat "<planning_dir>/claude-plan.md")
```

### Step 2: Launch Both Reviews in Parallel

Use TWO Agent tool calls in a single message with different `subagent_type` values:

**Architecture Review:**
Use the `feature-dev:code-reviewer` subagent with the review prompt and plan content.

**Security Review:**
Use the `security-scanner` subagent or a general-purpose agent with security focus.

### Step 3: Write Review Files

Create `<planning_dir>/reviews/` directory and write:
- `architecture-review.md` - Architecture analysis
- `security-review.md` - Security analysis

Format each file:
```markdown
# {Reviewer} Review

**Focus:** {architecture|security}
**Generated:** {timestamp}

---

{review_content}
```

## Handling Failures

| Scenario | Action |
|----------|--------|
| One reviewer fails | Write the successful review, note the failure |
| Both fail | Ask user if they want to retry or skip external review |

## Notes

- Both reviews run as Claude Code subagents in parallel
- No external CLI installation required
- Reviews use the same model and context as the parent session
