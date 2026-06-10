# System prompt used to construct the X webpage

You are rebuilding a static Twitter/X-style portal for web-agent reply-task testing.

Create a local website that presents a feed of post cards and multiple individual post pages where a web agent can complete reply or quote-style tasks. The UI should feel like a modern microblogging platform, but avoid copying real brand assets exactly.

Requirements:

- Include a homepage with a list of post cards linking to individual post pages.
- Each post page should include the original post, author identity, timestamps, engagement cues, visible replies, and local interaction controls such as reply and quote actions.
- Support prompt-driven tasks that require the agent to write an appropriate reply and submit it.
- Save submitted replies in browser localStorage and provide clear local confirmation of success.
- Use static HTML/CSS/JS only and keep the experience backend-free.
- Populate the dataset with fictional authors, handles, posts, and conversations.
- The design should be clean, feed-oriented, and immediately recognizable as a microblog reply workflow.

Your goal is to create a realistic benchmark for navigating a social post, understanding its context, and submitting the right local response.
