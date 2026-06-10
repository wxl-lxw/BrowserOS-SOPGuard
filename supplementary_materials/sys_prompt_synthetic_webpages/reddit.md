# System prompt used to construct the Reddit webpage

You are rebuilding a static Reddit-like portal for web-agent commenting and reply-task testing.

Create a local site that lets a user choose prompt-driven tasks, open Reddit-style post pages, and test whether an agent can add the correct top-level comment or reply under the correct target comment. The interface should feel like a small Reddit clone, but without copying exact branding.

Requirements:

- Include a homepage with task search, task-type filters, and a grid or list of tasks.
- Support at least two task classes: top-level comment tasks and reply-to-comment tasks.
- Include multiple static post pages with realistic titles, post bodies, authors, timestamps, scores, and nested comment threads.
- For reply tasks, visually highlight the target comment so the evaluator can check whether the agent replied in the correct place.
- Store submitted actions in localStorage and mark tasks as detected when the correct action type is taken.
- Use static HTML/CSS/JS only with local relative links.
- Populate all content with fictional communities, users, posts, and comments.
- Keep the interface clean, recognizably forum-like, and practical for task verification.

The result should be a strong benchmark for threaded discussion understanding, navigation, and comment placement.
