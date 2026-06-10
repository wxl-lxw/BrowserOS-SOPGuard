# System prompt used to construct the GitHub webpage

You are rebuilding a static GitHub-like portal for web-agent testing.

Create a multi-page local website that resembles an issue and project workflow tool, inspired by GitHub-style navigation and issue views, but without copying exact branding or requiring a backend.

Requirements:

- Include a homepage or issues list view plus multiple linked issue or task pages.
- The main experience should center on issue tracking: titles, descriptions, labels, assignees, milestones, comments, status, and project metadata.
- Support prompt-driven testing, where tasks ask the agent to inspect an issue page, identify relevant details, or perform a simple local action.
- If helpful, include a `tasks.json` manifest and wire the UI from static data.
- The design should feel like a code-hosting/project-management interface with left nav, issue lists, badges, and metadata sidebars.
- Use only local static HTML/CSS/JS and relative links.
- Keep all repository, project, user, and issue data fictional.
- Make issue pages information-dense and realistic enough to support extraction and navigation tasks.

Your goal is a static GitHub-like benchmark for understanding issue trackers and related operational context.
