---
name: tool-research-publishing
description: Use when the research is complete and needs to be turned into a multi-file Markdown package with a main index, one-pager, linked sections, tables, and Mermaid diagrams.
---

# Tool Research Publishing

## Overview

Use this skill to turn the research into a structured deliverable that is easy to navigate online. The result should feel like a small website or report, not a dump of analysis notes.

This skill runs after the sequential research workflow is complete.

## Workflow

1. Create `research/index.md` as the canonical entry point.
2. Create or finalize `research/00-task-list.md` so it reflects what was completed.
3. Create `research/one-pager.md` as the fast-read summary.
4. Create numbered section files for the full analysis, including pricing and operating model.
5. Create `research/tool-profiles/` pages for the candidate tool, current tools, and key competitors when deep profiling was done.
6. Link every secondary file from `research/index.md`.
7. Link every secondary file back to `research/index.md`.
8. Use tables and Mermaid diagrams when they improve clarity or navigation.
9. Remove or merge orphaned notes so the package reads as one coherent artifact.

## Required Output

The final package must include:

- `research/00-task-list.md`
- `research/index.md`
- `research/one-pager.md`
- Detailed numbered Markdown files
- Tool profile pages when multiple tools were researched
- Cross-links that make the reading order obvious

## Publishing Rules

- The main index must describe each linked file in one or two lines.
- The task list must be linked prominently and use checked and unchecked boxes.
- The one-pager must summarize the recommendation, rationale, risks, and next steps.
- Numbered files should read in sequence.
- Tool profile pages should be grouped and linked consistently so the reader can jump between them easily.
- Keep appendices separate from the main reading flow.
- Do not leave important conclusions buried only in appendices.

## Resources

- Use `assets/index-template.md` for the main entry point.
- Use `assets/task-list-template.md` for the live checklist.
- Use `assets/one-pager-template.md` for the concise summary.
- Use `assets/section-template.md` for numbered detail pages.
