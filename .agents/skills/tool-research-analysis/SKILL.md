---
name: tool-research-analysis
description: Use after intake and baseline work to research the candidate tool, analyze relevant competitors, and compare the candidate to both the current stack and the broader market.
---

# Tool Research Analysis

## Overview

Use this skill for the core research and comparison work. The candidate tool must be evaluated against the user's goals, expected users, the current baseline, and the relevant competitive landscape.

This skill should synthesize across tool profiles rather than trying to discover every fact from scratch in one pass.

The workflow is sequential. Do not skip ahead to synthesis until the relevant tool profiles are complete.

## Workflow

1. Read the intake brief and baseline summary.
2. Identify the tools that need deep profiles: the candidate tool, tools already in use, and the most relevant competitors.
3. Run `tool-research-tool-profile` for the candidate tool first.
4. Run `tool-research-tool-profile` for each important incumbent or competitor one at a time.
5. Update the task list as each tool profile is completed or as new profile tasks are discovered.
6. Synthesize the resulting profiles using the lenses in `references/research-lenses.md`.
7. Compare the candidate tool against both the incumbent tools and the broader market.
8. Produce a fit-gap analysis, explicit tradeoffs, and a recommendation input for publishing.

## Required Output

Produce the following:

- Candidate tool profile
- Detailed profile pages for each tool in scope
- Competitive landscape summary
- Pricing estimate with assumptions about seats and user roles
- Comparison tables against incumbent and market alternatives
- Fit-gap analysis tied to the user's criteria
- Major risks, assumptions, and unresolved questions
- Preliminary recommendation with confidence level

## Working Rules

- Separate verified facts from inference.
- Do not treat a broad feature list as a recommendation.
- Make switching costs explicit when a current tool baseline exists.
- Prefer a small number of relevant competitors over a long generic list.
- Prefer one deep profile per important tool over shallow coverage of many tools.
- Keep the research ordered and sequential, even when the process takes longer.
- Keep `research/00-task-list.md` current so completed work and remaining work are visible.

## Handoff

Pass the research package to `tool-research-publishing`.

## Resources

- Read `references/research-lenses.md` before starting detailed analysis.
- Use `tool-research-tool-profile` to research individual tools in depth.
