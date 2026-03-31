# Tool Researcher

Tool Researcher is a GitHub template for evaluating whether a tool is worth investing in. It is designed for situations where you want more than a quick feature check and need a structured view of the tool, the alternatives, the current state, and the tradeoffs.

When you create a repository from this template, the repository becomes a workspace for researching one tool in depth. The AI guides the user through clarifying questions, gathers the right context, researches the tool and its competitors, and produces a final recommendation in a format that is easy to review and share.

## Run The Website

This template includes a small Node.js static server so the website can load `index.md` over HTTP instead of relying on `file://`.

```bash
npm start
```

Then open `http://127.0.0.1:3000`.

## What This Template Is For

- Understanding what a tool does and who it is best suited for
- Comparing a tool against the tools already in use
- Comparing a tool against relevant competitors in the market
- Evaluating pricing, hosting, enterprise readiness, and tradeoffs
- Deciding whether to invest, pilot, defer, or reject

## How The Template Helps

The template uses an AI-guided workflow to:

- Ask clarifying questions before research starts
- Ask what similar tools are already in use
- Research the current tools first to establish a baseline
- Research the candidate tool and the most relevant competitors
- Compare the tools across the criteria that matter for the decision
- Track progress with a task list so the user can see what is complete and what remains
- Present the findings as a linked research package

## What The AI Will Ask About

To make the research useful, the AI will typically ask for:

- The tool being evaluated
- The business problem to solve
- Users and stakeholders
- Expected number of users or seats
- User roles such as PMs, developers, designers, or operators
- Similar tools already in use
- Pain points with the current workflow
- Must-have requirements and constraints
- Budget or pricing sensitivity
- Any extra notes, links, documents, or prior analysis the user already has

## What The AI Researches

The resulting analysis is expected to cover:

- Feature coverage and differentiators
- Hosting model, such as cloud, local, self-hosted, or hybrid
- Enterprise readiness, such as SSO, SCIM, admin controls, and enterprise licensing
- Pricing, licensing, and likely total cost of ownership
- Current-state fit versus replacement effort
- Competitive landscape and market position
- Risks, unknowns, and tradeoffs

## What The Output Looks Like

The final result is meant to read like a small website or book rather than a loose set of notes. The output can include multiple Markdown files, Mermaid diagrams, and tables, with a main entry page that links to the rest of the research.

A typical output package includes:

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
- `research/tool-profiles/` for one deep page per tool in scope

The main `research/index.md` file should guide the reader through the rest of the package in order.

## In Practice

If you wanted to evaluate a tool such as Lovable, this template would help the AI:

- Ask what similar tools are already in use
- Research those tools first
- Research Lovable and the most relevant alternatives
- Compare them on features, hosting model, enterprise features, and pricing
- Produce a recommendation based on the user's actual context

The repo includes AI workflow instructions and reusable skills to support that process.
