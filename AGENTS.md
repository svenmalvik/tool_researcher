# Tool Researcher Agents

## Purpose

This repository is a template for researching a tool, its capabilities, and the competitive landscape around it to decide whether it is worth investing in.

The work should not stop at feature discovery. The goal is to produce a defensible recommendation based on the user's goals, the tools already in use, the broader market, and the practical cost of adoption.

## Operating Model

- Start with clarifying questions before doing broad research.
- Create a task list at the start of the run and keep it updated as work is completed.
- Always ask what similar or adjacent tools are already in use today.
- Research the current tools first so the evaluation has a real baseline.
- Research the candidate tool and relevant competitors after the baseline is clear.
- Build one deep profile per relevant tool in scope: current tools, candidate tool, and the most relevant competitors.
- Run the workflow in sequence from intake to baseline to tool profiles to synthesis to publishing, even when the work takes time.
- Complete each tool profile one at a time before moving to final synthesis.
- Publish the results as a linked Markdown package that reads like a book or website, not a loose collection of notes.

## Required Sequence

Follow this order unless the user explicitly asks for a different flow:

1. Intake and clarifying questions
2. Create and maintain the task list
3. Baseline research on current tools already in use
4. Deep profile of the candidate tool
5. Deep profile of each relevant competitor or incumbent tool
6. Cross-tool comparison and synthesis
7. Final publishing into the linked Markdown package

## Task Tracking

Create `research/00-task-list.md` at the start of the run.

The task list must:

- Use Markdown checkboxes
- Show what is completed and what is still remaining
- Be updated whenever a major task is finished
- Be refined when new competitor, baseline, pricing, or publishing tasks are discovered
- Stay aligned with the actual workflow so both the user and the AI can see progress clearly

## Required Intake

Before research begins, gather at least the following:

- The tool being evaluated
- The business problem or job to be done
- The primary users and stakeholders
- The expected number of users or seats
- The types of users, such as PMs, developers, designers, operators, or executives
- Similar tools already in use
- What is working well with the current tools
- What is missing or painful with the current tools
- Must-have capabilities and non-negotiable constraints
- Decision criteria, timeline, and desired level of confidence
- Any additional information, documents, notes, links, or prior analysis the user already has

If the user does not know which similar tools are already in use, ask for the closest known substitutes or the current workflow that the candidate tool would replace.

Always ask whether the user has extra context that should be considered before research starts, such as internal notes, known concerns, existing comparisons, vendor material, procurement context, or technical constraints.

Always ask enough about user count and user roles to make pricing analysis realistic. If exact numbers are unknown, capture a reasonable estimate or range and mark it as an assumption.

## Agent Roles

Use these roles as responsibilities, even when a single agent performs all of the work:

- `research-orchestrator`: owns the end-to-end flow, keeps scope coherent, and decides what needs to be researched next.
- `baseline-analyst`: studies the tools already in use, captures the current state, and identifies switching costs.
- `tool-profile-analyst`: owns one deep profile at a time and documents facts, constraints, and fit before the workflow advances.
- `market-analyst`: studies the candidate tool, direct competitors, and market positioning.
- `report-compiler`: turns the work into a navigable Markdown package with clear structure, summaries, diagrams, and tables.

## Required Research Lenses

Every serious evaluation should cover the lenses below. Skip a lens only when it is clearly irrelevant and state why.

- Use-case fit and expected outcomes
- Current-state baseline and incumbent tool coverage
- Feature coverage, strengths, and gaps
- Hosting and deployment model, such as cloud, local, self-hosted, or hybrid
- Enterprise readiness, such as SSO, SCIM, admin controls, and enterprise licensing
- Competitive landscape and differentiation
- Implementation and integration effort
- Pricing, licensing, and total cost of ownership
- Pricing fit for the expected number and type of users
- Security, compliance, and operational concerns when relevant
- Vendor maturity, adoption signals, and long-term risk
- Recommendation, confidence level, and next steps

## Output Contract

Write the final output as a multi-file Markdown package under `research/`.

The package must include:

- `research/00-task-list.md`: the live checklist for the run
- `research/index.md`: the canonical entry point and reading guide
- `research/one-pager.md`: the concise summary for fast review
- Numbered section files for the detailed analysis
- Tool profile pages for the candidate tool, incumbent tools, and key competitors

The output rules are strict:

- `research/index.md` must link to every secondary Markdown file.
- Every secondary Markdown file must link back to `research/index.md`.
- The main file must explain the reading order so the result feels like a book or website.
- The task list must show checked and unchecked items so progress is visible.
- Every tool profile page must be linked from both `research/index.md` and the competitive-landscape section.
- Use Markdown tables and Mermaid diagrams where they improve navigation or understanding.
- Avoid orphan files, dead-end pages, and duplicated conclusions across files.

## Suggested Output Structure

Use this structure unless the project needs a better one:

- `research/00-task-list.md`
- `research/index.md`
- `research/one-pager.md`
- `research/01-context-and-goals.md`
- `research/02-current-state-baseline.md`
- `research/03-candidate-tool-profile.md`
- `research/04-competitive-landscape.md`
- `research/05-pricing-and-operating-model.md`
- `research/06-fit-gap-and-tradeoffs.md`
- `research/07-recommendation.md`
- `research/tool-profiles/` for one detailed page per tool in scope
- `research/appendices/` for large comparison matrices, source notes, or supporting detail

## Writing Standards

- Separate verified facts from inference.
- State assumptions explicitly.
- Cite sources with links when external research is used.
- Compare the candidate tool both to the current tools in use and to the broader market.
- Estimate pricing using the user's expected seat count and user roles whenever direct pricing is incomplete or tiered.
- Capture hosting model, enterprise capabilities, and administrative readiness for each tool profile.
- Make tradeoffs explicit instead of hiding them in neutral language.
- End with a recommendation such as `invest`, `pilot`, `defer`, or `reject`, plus the reasoning and confidence level.
