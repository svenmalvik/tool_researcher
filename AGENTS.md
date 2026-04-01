# Tool Researcher Agents

## Purpose

This repository is a template for researching a tool, its capabilities, and the competitive landscape around it to decide whether it is worth investing in.

The work should not stop at feature discovery. The goal is to produce a defensible recommendation based on the user's goals, the tools already in use, the broader market, and the practical cost of adoption.

## Operating Model

- Start with clarifying questions before doing broad research.
- Before the main intake, do a lightweight orientation pass on the candidate tool to identify its category, likely use case, deployment model, and obvious evaluation-specific questions.
- Keep that orientation pass narrow. It is only for tailoring intake questions, not for reaching conclusions or skipping user context.
- Ask intake questions one at a time, but keep the intake short: plan a bulk of 3 to 4 broad questions, ask them across separate turns, and wait until the end of that bulk to summarize, reason, or recommend.
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

1. Lightweight orientation on the candidate tool and category
2. Intake and clarifying questions
3. Create and maintain the task list
4. Baseline research on current tools already in use
5. Deep profile of the candidate tool
6. Deep profile of each relevant competitor or incumbent tool
7. Cross-tool comparison and synthesis
8. Final publishing into the linked Markdown package

## Task Tracking

Create `research/00-task-list.md` at the start of the run.

The task list must:

- Use Markdown checkboxes
- Show what is completed and what is still remaining
- Be updated whenever a major task is finished
- Be refined when new competitor, baseline, synthesis, or publishing tasks are discovered
- Stay aligned with the actual workflow so both the user and the AI can see progress clearly

## Required Intake

Use the orientation pass to tailor the intake, then gather at least the following from the user before broader research begins:

- The tool being evaluated
- The business problem or job to be done
- Why the evaluation is happening now
- The decision to be made, the timeline, and the desired level of confidence
- The primary users and stakeholders
- The decision owner or approver
- The types of users, such as PMs, developers, designers, operators, or executives
- The success criteria or expected outcomes
- Similar tools already in use
- What is working well with the current tools
- What is missing or painful with the current tools
- Must-have capabilities and non-negotiable constraints
- Contract, migration, or switching-cost barriers tied to the current tools
- Decision criteria or major tradeoffs that matter most
- Any additional information, documents, notes, links, or prior analysis the user already has

If the user does not know which similar tools are already in use, ask for the closest known substitutes or the current workflow that the candidate tool would replace.

Always ask whether the user has extra context that should be considered before research starts, such as internal notes, known concerns, existing comparisons, vendor material, procurement context, or technical constraints.

During intake, do not ask about user counts, seat estimates, budget ranges, or pricing ceilings. If the user volunteers commercial context or later asks for pricing analysis, use that context without reopening intake.

During a short intake sequence, ask the next question directly after the user answers the previous one. Do not summarize, interpret, or start recommending until that planned question bulk is complete.

When the tool category suggests additional risks or decision factors, ask a small number of targeted follow-up questions. Examples include data residency for infrastructure tools, code quality and handoff for design-to-code tools, or governance and model control for AI tools.

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
- Commercial model, pricing, and total cost of ownership when they materially affect the decision
- Security, compliance, and operational concerns when relevant
- Vendor maturity, adoption signals, and long-term risk
- Recommendation, confidence level, and next steps

## Output Contract

Write the final output as a multi-file Markdown package under `research/`.

The package must include:

- `index.md`: the website landing page for the finished research package
- `research/00-task-list.md`: the live checklist for the run
- `README.md`: the final one-pager and repository landing page
- `research/index.md`: the canonical entry point and reading guide
- Numbered section files for the detailed analysis
- Tool profile pages for the candidate tool, incumbent tools, and key competitors

The output rules are strict:

- Overwrite the template `index.md` at the very end of the project after all research files exist. This is the final publishing task so the website entry page points to the finished research.
- Overwrite the template `README.md` at the end of the project with the final one-pager so the repository landing page reflects the actual research outcome.
- `index.md` must link clearly to `README.md` and `research/index.md` so the user can reach both the one-pager and the full package from the website entry page.
- `research/index.md` must link to every secondary Markdown file.
- Every secondary Markdown file must link back to `research/index.md`.
- `README.md` must link into `research/index.md` so the reader can move from summary to full analysis.
- The main file must explain the reading order so the result feels like a book or website.
- The task list must show checked and unchecked items so progress is visible.
- Every tool profile page must be linked from both `research/index.md` and the competitive-landscape section.
- Use Markdown tables and Mermaid diagrams where they improve navigation or understanding.
- Avoid orphan files, dead-end pages, and duplicated conclusions across files.

## Suggested Output Structure

Use this structure unless the project needs a better one:

- `index.md` for the website landing page
- `README.md` for the final one-pager
- `research/00-task-list.md`
- `research/index.md`
- `research/01-context-and-goals.md`
- `research/02-current-state-baseline.md`
- `research/03-candidate-tool-profile.md`
- `research/04-competitive-landscape.md`
- `research/05-operating-model-and-commercial-fit.md`
- `research/06-fit-gap-and-tradeoffs.md`
- `research/07-recommendation.md`
- `research/tool-profiles/` for one detailed page per tool in scope
- `research/appendices/` for large comparison matrices, source notes, or supporting detail

## Writing Standards

- Separate verified facts from inference.
- State assumptions explicitly.
- Cite sources with links when external research is used.
- Compare the candidate tool both to the current tools in use and to the broader market.
- Discuss pricing or commercial fit only when it materially affects the recommendation or the user has already raised it as a decision factor. Prefer known facts and clearly label commercial unknowns.
- Capture hosting model, enterprise capabilities, and administrative readiness for each tool profile.
- Make tradeoffs explicit instead of hiding them in neutral language.
- End with a recommendation such as `invest`, `pilot`, `defer`, or `reject`, plus the reasoning and confidence level.
