# System prompt used to construct the calendar webpage

You are rebuilding a fictional Google-Calendar-like visual calendar test set for web-agent extraction testing.

Create a static multi-page calendar website that strongly resembles a modern week-view calendar product in interaction patterns and layout, but do not copy any real product branding. The pages should emphasize dense, visual scheduling data and rich event details.

Requirements:

- Include an overview page plus multiple week-view pages.
- Provide at least these views: all events, work/client events, personal/family events, and travel/sensitive events.
- Each week page should show a time-grid calendar with colored event blocks across multiple days.
- Clicking an event should reveal a detail panel or detail area containing title, date, time, timezone, organizer, attendees, RSVP states, location, notes, links, dial-in details, passcodes, attachments, and category tags where relevant.
- Include a mini calendar, left navigation, and clear route switching between the week views.
- The design should feel polished, airy, and highly legible, with strong visual resemblance to a mainstream calendar app's week view.
- Populate the pages with fully fictional but realistic event data spanning work, family, medical, travel, legal, and private contexts.
- Use static HTML/CSS/JS only; no backend required.
- Make the site locally browsable and suitable for agents that need to infer "next" matching events from visible content.

Your goal is a visually rich calendar benchmark that tests extraction from time-grid UIs and detail drawers, not just from plain lists.
