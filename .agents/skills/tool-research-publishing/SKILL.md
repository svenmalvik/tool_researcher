---
name: tool-research-publishing
description: Use when the research is complete and needs to be turned into a multi-file Markdown package with a main index, one-pager, linked sections, tables, and Mermaid diagrams.
---

# Tool Research Publishing

## Overview

Use this skill to turn the research into a structured deliverable that is easy to navigate online. The result should feel like a small website or report, not a dump of analysis notes.

This skill runs after the sequential research workflow is complete.

## Workflow

1. Overwrite `README.md` with the final one-pager so the repository landing page reflects the finished research.
2. Create `research/index.md` as the canonical entry point for the full package.
3. Create or finalize `research/00-task-list.md` so it reflects what was completed.
4. Create numbered section files for the full analysis, including operating model and commercial fit when it matters.
5. Create `research/tool-profiles/` pages for the candidate tool, current tools, and key competitors when deep profiling was done.
6. Link the full package from `README.md`.
7. Link every secondary file from `research/index.md`.
8. Link every secondary file back to `research/index.md`.
9. Use tables and Mermaid diagrams when they improve clarity or navigation.
10. Remove or merge orphaned notes so the package reads as one coherent artifact.
11. Overwrite the top-level `index.md` last, after all other files are final, so the website entry page links to both `README.md` and `research/index.md`.

## Required Output

The final package must include:

- `index.md`
- `README.md`
- `research/00-task-list.md`
- `research/index.md`
- Detailed numbered Markdown files
- Tool profile pages when multiple tools were researched
- Cross-links that make the reading order obvious

## Publishing Rules

- The final update to top-level `index.md` is mandatory and should happen last.
- `index.md` must function as the website landing page and link clearly to `README.md` and `research/index.md`.
- The main index must describe each linked file in one or two lines.
- The task list must be linked prominently and use checked and unchecked boxes.
- `README.md` must act as the one-pager and summarize the recommendation, rationale, risks, and next steps.
- `README.md` should link clearly to `research/index.md` for the full package.
- Numbered files should read in sequence.
- Tool profile pages should be grouped and linked consistently so the reader can jump between them easily.
- Keep appendices separate from the main reading flow.
- Do not leave important conclusions buried only in appendices.

## Resources

- Use `assets/root-index-template.md` for the final top-level `index.md`.
- Use `assets/index-template.md` for the main entry point.
- Use `assets/task-list-template.md` for the live checklist.
- Use `assets/one-pager-template.md` as the content template for the final `README.md`.
- Use `assets/section-template.md` for numbered detail pages.
