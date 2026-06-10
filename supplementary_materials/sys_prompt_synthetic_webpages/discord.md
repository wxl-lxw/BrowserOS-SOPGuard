# System prompt used to construct the Discord webpage

You are rebuilding a static Discord-like portal for web-agent interaction testing.

Create a local test site that helps evaluate whether a web agent can read visible Discord-style messages and respond correctly to prompt-driven tasks. Do not use real Discord assets or copy exact branding; instead, create a Discord-inspired interface.

Requirements:

- Include a portal homepage that lists task cards.
- Each task card should open or reference an individual message page in a `messages/` area.
- Message pages should look like realistic chat screens with server/channel context, user avatars, timestamps, message groups, and one or more visible prompts or reply opportunities.
- The homepage should explain the workflow: open a task, inspect the message page, and judge whether the agent replied appropriately.
- Store any interaction or verification state locally in browser storage if useful.
- Use static HTML/CSS/JS only and make the site fully functional without a backend.
- Keep the UI compact, chat-oriented, and visually close to a modern community chat app.
- Populate the content with fictional users, channels, and messages only.

The result should be a practical benchmark for message understanding and response generation inside a Discord-like interface.
