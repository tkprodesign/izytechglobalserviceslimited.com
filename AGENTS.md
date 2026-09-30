# IZY TECHNOLOGIES — AGENT OPERATING RULES

This file is the first-stop instruction file for every coding agent, AI assistant, IDE agent, or human developer working in this repository.

## Mandatory read order

Before changing anything:

1. Read this file.
2. Read `AGENT_HANDOFF.md` for the current architecture, production state, and continuity rules.
3. Read the newest entries in `CHANGELOG.md`.
4. Read `.github/copilot-instructions.md` when the client supports repository instructions.
5. Read `replit.md` when working through Replit.

Always start from the latest `main`. Do not assume an earlier conversation, local checkout, or cached repository state is current.

## Mandatory change record

**Every repository change that alters code, configuration, deployment behavior, database behavior, security, content, UI, APIs, or user-visible behavior MUST update `CHANGELOG.md` in the same commit.**

This is not optional and does not depend on the user reminding the agent.

Documentation-only edits may update the relevant documentation without a changelog entry when they do not alter project behavior.

For every meaningful change, add the newest entry at the top of `CHANGELOG.md` using this format:

```md
## YYYY-MM-DD — Short change title

**Agent / tool:** ChatGPT, Codex, Copilot, Replit Agent, human developer, etc.

### What changed
- Plain-language description of the work.
- Important files, routes, tables, APIs, or UI areas affected.

### Verification
- Build/tests/checks run and their result.
- Cloudflare deployment status when frontend changed.
- Render deployment and `/api/health` status when backend changed.

### Notes
- Migration, compatibility, follow-up, or operational details, if any.
```

Do not put secrets, passwords, API keys, tokens, private database URLs, or secret values in any Markdown record.

## When to update AGENT_HANDOFF.md

Update `AGENT_HANDOFF.md` whenever a change affects the repository's current operating state, including:

- architecture or hosting
- authentication/security behavior
- database schema or important data model behavior
- deployment workflows
- major routes/features
- external integrations
- durable conventions future agents must preserve

The changelog records **what happened**. The handoff records **what is true now**.

## Completion rule

A task is not complete until:

1. the requested change is implemented;
2. relevant tests/builds pass;
3. `CHANGELOG.md` is updated in the same commit;
4. `AGENT_HANDOFF.md` is updated if the current-state description changed;
5. the commit is pushed to `main`;
6. relevant deployment checks are successful.

The CI workflow contains a guard that rejects code/config changes whose commit does not update `CHANGELOG.md`.

## Security

Never expose, log, or commit secret values. Use the repository/platform secret stores. Do not weaken authentication, role checks, login throttling, password-change verification, analytics privacy boundaries, or private-file access controls without an explicit approved requirement.
