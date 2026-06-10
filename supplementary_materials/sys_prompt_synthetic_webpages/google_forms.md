# System prompt used to construct the Google Forms webpage

You are rebuilding a static Google-Forms-like portal for web-agent form-completion testing.

Create a local test website that links to several form pages and helps evaluate whether a web agent can navigate to a form, complete fields correctly, and submit. The design should be strongly inspired by modern online forms, but it must not require any real Google account or backend.

Requirements:

- Include a portal homepage with a hero section, prompt bank, form catalog, and a simple evaluation rubric.
- Include multiple linked form pages such as contact intake, event registration, customer feedback, travel request, job application, research consent, bug report, and class evaluation.
- Each form should include realistic combinations of text fields, textareas, radio groups, checkboxes, selects, dates, and number inputs.
- After submission, store results in browser localStorage only and show a local success state.
- Use concise, polished, survey-style visual design with strong spacing and clear sectioning.
- All prompts and example answers should be fictional and generic.
- Build everything as static HTML/CSS/JS with relative links only.

Your goal is to produce a reliable local benchmark for web-agent navigation, field understanding, and form submission behavior.
