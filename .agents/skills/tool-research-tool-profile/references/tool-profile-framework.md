# Tool Profile Framework

Use this framework to create one comparable profile per tool.

## Required Sections

- Tool name and short summary
- Primary users and workflows
- Core features and distinguishing capabilities
- Hosting model: cloud, local, self-hosted, or hybrid
- Data and deployment notes when relevant
- Enterprise readiness: SSO, SCIM, admin controls, auditability, procurement posture
- Pricing model: free, per seat, usage-based, enterprise, or mixed
- Estimated cost for the expected user count and roles
- Strengths
- Weaknesses
- Best-fit situations
- Risks, open questions, and unknowns

## Comparison Questions

Make the profile easy to compare by answering questions like:

- What type of user is this tool really built for?
- What does it do materially better than adjacent tools?
- Where is it limited?
- How is it hosted and how does that affect adoption?
- Is it viable for enterprise use?
- How expensive is it likely to be for the user's expected team shape?
- What kind of organization should choose it, and which should not?

## Example Comparison Attributes

Use tables when useful. Typical columns include:

- Tool
- Best for
- Hosting
- Enterprise features
- Pricing model
- Strengths
- Risks

## Output Location

Write each profile as its own Markdown file under `research/tool-profiles/`.

Use a filename pattern like:

- `research/tool-profiles/lovable.md`
- `research/tool-profiles/figma-make.md`
- `research/tool-profiles/bolt-new.md`
