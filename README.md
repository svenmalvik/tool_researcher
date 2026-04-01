# Tool Researcher

Tool Researcher is a starter workspace for evaluating whether a tool is worth investing in. It is designed for situations where you want more than a quick feature check and need a structured view of the tool, the alternatives, the current state, what the community is saying, and the tradeoffs.

When you create a repository from this template, the repository becomes a working area for one evaluation. The AI guides the user through clarifying questions, gathers the right context, researches the tool and its competitors, and produces a final recommendation in a format that is easy to review and share.

## Lifecycle

This repository has two phases:

1. Starter phase: the root `README.md` and `index.md` explain how the workspace should be used.
2. Publishing phase: once the research package is complete, those same root files are overwritten with the final one-pager and website landing page.

During the active research run, the real output should live under `research/`.
Start there as soon as the short intake is complete.

The intended sequence is:

1. Do the orientation pass and intake.
2. Create `research/00-task-list.md` and `research/index.md`.
3. Build the rest of the research package under `research/`.
4. Replace the root `README.md` and `index.md` only at the very end.

## Run The Website

This template uses a Vite app shell so the website can be developed locally and deployed to Vercel without a custom server.
The app prefers `research/index.md` when it exists, and otherwise falls back to the starter root docs.

```bash
npm install
npm run dev
npm run build
```

The local workspace prefers `http://127.0.0.1:5174` and falls back to the next available local port when `5174` is already in use.
If the server is already running for this repo, `npm run dev` should reuse it instead of starting another copy on a different port.

## What The Workspace Is For

- Understanding what a tool does and who it is best suited for
- Comparing a tool against the tools already in use
- Comparing a tool against relevant competitors in the market
- Evaluating operating model, enterprise readiness, tradeoffs, and commercial fit when it matters
- Deciding whether to invest, pilot, defer, or reject

## How The Template Helps

The template uses an AI-guided workflow to:

- Do a quick orientation pass on the candidate tool so the intake can adapt to the tool category
- Ask clarifying questions before research starts
- Ask a short sequence of broad intake questions one at a time
- Hold summary and reasoning until the end of that intake sequence
- Ask what similar tools are already in use
- Research the current tools first to establish a baseline
- Research the candidate tool and the most relevant competitors
- Research what practitioners and customers are saying about the candidate tool and the alternatives
- Compare the tools across the criteria that matter for the decision
- Track progress with a task list so the user can see what is complete and what remains
- Present the findings as a linked research package

## What The AI Will Ask About

To make the research useful, the AI will typically ask for:

- A few category-specific questions informed by a quick first look at the tool
- The tool being evaluated
- The business problem to solve
- Why the evaluation is happening now
- The decision to be made, the timeline, and the approval owner
- Users and stakeholders
- User roles such as PMs, developers, designers, or operators
- Success criteria or desired outcomes
- Similar tools already in use
- Pain points with the current workflow
- Must-have requirements and constraints
- Migration, procurement, or switching-cost constraints
- Any known community concerns, praise, or claims that should be checked
- Any extra notes, links, documents, or prior analysis the user already has

## What The AI Researches

The resulting analysis is expected to cover:

- Feature coverage and differentiators
- Hosting model, such as cloud, local, self-hosted, or hybrid
- Enterprise readiness, such as SSO, SCIM, admin controls, and enterprise licensing
- Commercial model or pricing where it materially affects the decision
- Current-state fit versus replacement effort
- Competitive landscape and market position
- Community sentiment and practitioner feedback across the tool and alternatives
- Risks, unknowns, and tradeoffs

## What The Output Looks Like

The final result is meant to read like a small website or book rather than a loose set of notes. The output can include multiple Markdown files, Mermaid diagrams, and tables, with a main entry page that links to the rest of the research.

When the research is finished, this starter `README.md` should be replaced with the final one-pager so the repository landing page reflects the actual recommendation instead of the onboarding guidance.

A typical output package includes:

- `index.md` for the website landing page
- `README.md` for the final one-pager
- `research/00-task-list.md`
- `research/index.md`
- `research/01-context-and-goals.md`
- `research/02-current-state-baseline.md`
- `research/03-candidate-tool-profile.md`
- `research/04-competitive-landscape.md`
- `research/05-community-sentiment.md`
- `research/06-operating-model-and-commercial-fit.md`
- `research/07-fit-gap-and-tradeoffs.md`
- `research/08-recommendation.md`
- `research/tool-profiles/` for one deep page per tool in scope

The main `research/index.md` file should guide the reader through the rest of the package in order.
The top-level `index.md` should be regenerated last so the website entry page points to the finished one-pager and the full research package.

## In Practice

If you wanted to evaluate a tool such as Lovable, this template would help the AI:

- Ask what similar tools are already in use
- Research those tools first
- Research Lovable and the most relevant alternatives
- Look at what builders are saying publicly about Lovable and its alternatives, not just the vendor pages
- Compare them on features, hosting model, enterprise features, and commercial fit when relevant
- Produce a recommendation based on the user's actual context

The repo includes AI workflow instructions and reusable skills to support that process.
