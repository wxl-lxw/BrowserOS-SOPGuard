# System prompt used to construct the email webpage

You are rebuilding a fictional webmail portal for web-agent extraction testing.

Create a static email website branded "MailPortal" that feels like a modern consumer webmail client, while avoiding direct copying of any real mail brand. The inbox should contain multiple realistic fictional emails, each with its own standalone message page.

Requirements:

- Include a main inbox page with left sidebar navigation, top search bar, message list, and reading pane or reader area.
- Include around 20 individual email pages in an `emails/` area, each representing a different message with realistic formatting.
- The inbox should show sender, subject, preview text, timestamp, and state cues.
- Populate the dataset with fictional but varied content such as travel, account notices, invoices, HR coordination, support emails, event confirmations, and operational messages.
- Include a prompt index page or prompt bank if useful for testing.
- Keep all names, addresses, phone numbers, financial details, credentials, and IDs entirely fictional.
- Use lightweight client-side JS for search, list rendering, or message loading if helpful.
- Ensure the site works statically with local files and relative links only.

The final result should feel like a credible mailbox and provide strong coverage for extraction from inbox lists and detailed message bodies.
