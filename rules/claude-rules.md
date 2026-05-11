# Claude Code Rules

## 1. Planning First (Mandatory)
- For every user request:
  - Analyze the problem
  - Read the existing codebase (if applicable)
  - Generate a structured plan BEFORE writing any code
- The plan must be written to: `task/todo.md`
- The plan must:
  - Be a checklist of discrete, ordered tasks
  - Include clear, actionable steps
- STOP and wait for user approval before execution

---

## 2. Execution Control
- Do NOT modify, create, or delete any files without explicit user approval
- Prefer step-by-step execution over large batch changes
- After completing each task:
  - Mark it as complete in `task/todo.md`
- Provide clear explanations of what is being done at each step
- **Read every approval prompt aloud to the user in plain English before asking them to confirm** — never assume they know what a command or file change does

---

## 3. Task Tracking & Documentation
- Maintain a persistent `task/todo.md` file
- Structure:
  - Task checklist
  - Status updates (checked/unchecked)
  - Final **Review Section** summarizing:
    - Files created/modified
    - Key decisions made
    - Any tradeoffs or assumptions

---

## 4. Code Quality Standards
- Follow clean, readable, and maintainable coding practices
- Prefer:
  - Modular design
  - Clear naming conventions
  - Separation of concerns
- Avoid:
  - Unnecessary complexity
  - Large monolithic files
- Ensure consistency with existing project structure and patterns

---

## 5. Plan Mode Enforcement
- Always operate in **plan-first mode** for:
  - New features
  - Refactors
  - Multi-step changes
- Do NOT skip planning unless explicitly instructed
- **Permission mode during planning should be set to Plan Mode** (Shift+Tab in Claude Code) so no files can be changed while the plan is being written and reviewed

---

## 6. Git & Checkpoints
- After every successful and verified step:
  - Suggest committing changes
- Keep commits:
  - Small
  - Atomic
  - Descriptive
- Use GitHub as a rollback mechanism
- **Before the first session, ensure Git for Windows is installed** and the GitHub repository is initialized — Claude Code requires Git to function on Windows
- **Never push directly to `main`** without user confirmation

---

## 7. Security (Non-Negotiable)
- After generating or modifying code:
  - Perform a security review
- Ensure:
  - No API keys or secrets in frontend code
  - Sensitive data is handled securely (backend only)
  - OAuth tokens are stored using secure on-device storage (e.g. `keytar`), never in plain text files
  - No obvious vulnerabilities are introduced
- Flag risks clearly before proceeding
- **If a security concern involves credentials or tokens, stop immediately and do not proceed until resolved**

---

## 8. Plan → Build → Secure Workflow
For every feature:
1. **Plan** — define tasks in `task/todo.md`, wait for approval
2. **Build** — execute step-by-step, one approval at a time
3. **Secure** — review for vulnerabilities before marking complete

Do not skip any stage.

---

## 9. Context Management
- Keep responses focused on the current task
- Avoid unnecessary context carryover
- Recommend using `/clear` when:
  - Starting a new feature
  - Context becomes large or noisy
- **At the start of every new feature or session, remind the user to use `/clear` and re-read `CLAUDE.md`**

---

## 10. CLAUDE.md — Project Memory
- A `CLAUDE.md` file must exist in the project root
- It must be created early in the first session and kept up to date throughout the project
- It should include:
  - The chosen tech stack and why it was selected
  - Folder structure overview
  - A pointer to this rules file (`rules/claude-rules.md`)
  - Any recurring conventions or decisions made during the build
- Claude should re-read `CLAUDE.md` at the start of every session to restore project context without requiring the user to repeat themselves

---

## 11. Permission Modes — Guidance
Claude Code has several permission modes. Use the right one for each phase:

| Mode | When to Use |
|------|-------------|
| **Plan Mode** | During planning — Claude can read but not change files |
| **Default Mode** | During building — every file change and command requires user approval |
| **Auto-Accept Edits** | Not recommended for this project — skip it |
| **Bypass Permissions** | Never use — this is dangerous and should be avoided entirely |

- Switch modes using **Shift+Tab** in Claude Code
- The current mode is always shown in the status bar
- **Default Mode is the recommended mode for this project** — it ensures the user approves every action

---

## 12. Explainability (Teaching Mode)
- This project is being built by someone returning to coding after a long break
- At every step, explain:
  - **What** is being done
  - **Why** it is being done
  - **What the risk or tradeoff is**, if any
- Define any technical term the first time it is used
- When asked, provide detailed walkthroughs as a senior engineer teaching a junior
- **Never assume prior knowledge of tools, commands, frameworks, or concepts**

---

## 13. Reusability & Efficiency
- Suggest creating **slash commands** for repetitive workflows
- Suggest using **agents** for:
  - Code reviews
  - Documentation
  - Testing
- Optimize for repeatable processes

---

## 14. Use of Visual Inputs
- If UI or layout is involved:
  - Encourage using screenshots or images
- Use images to:
  - Guide design
  - Debug layout issues
- **Remind the user that screenshots can be pasted directly into Claude Code** to help diagnose visual problems

---

## 15. Automation & Hooks (Advanced)
- Where appropriate, recommend hooks to:
  - Enforce formatting
  - Run checks automatically
  - Log actions
- Do not assume hooks exist unless confirmed

---

## 16. External Tools (MCP)
- When external data or tools are required:
  - Suggest using MCP servers
- Clearly state when MCP would improve results

---

## 17. Transparency & Explainability
- Clearly explain:
  - What is being done
  - Why it is being done
- When requested:
  - Provide detailed walkthroughs like a senior engineer teaching a junior

---

## 18. Error Handling & Recovery
- If something fails or is uncertain:
  - Stop and explain the issue in plain English
  - Propose at least two alternatives
- Do not continue blindly after errors
- **If an error involves a permission prompt or security boundary, treat it as a hard stop** — do not suggest workarounds that bypass safety checks

---

## 19. Default Behavior Summary
Claude must:
- Plan before coding
- Ask before changing files
- Track all work in `task/todo.md`
- Maintain and re-read `CLAUDE.md` each session
- Commit frequently (via suggestion)
- Validate security before completion
- Keep work structured, modular, and explainable
- Teach as it builds — explain every decision in plain English
- Stay in Default permission mode unless explicitly instructed otherwise
- Never push to `main` or bypass permissions without explicit user approval
