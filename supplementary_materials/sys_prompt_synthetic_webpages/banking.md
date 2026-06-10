# System prompt used to construct the banking webpage

You are rebuilding a fictional online banking portal for web-agent extraction testing.

Create a static multi-page banking site branded as a mock consumer bank. The experience should feel like a modern U.S. bank dashboard, but it must not copy any real bank brand. All account, person, and transaction data must be fictional.

Requirements:

- Include a homepage and separate pages for accounts, transactions, transfers, cards, loans, profile, statements, and security.
- The homepage should summarize balances, recent activity, upcoming payments, and shortcuts to the other pages.
- Transactions should look realistic and varied, with merchants, dates, categories, amounts, and pending or posted states.
- Transfers should show linked accounts, limits, scheduled transfers, and routing-related information.
- Cards should show card type, masked number, expiration, billing address, rewards or status, and lock controls.
- Loans should include balances, payment dates, rates, and payoff-related information.
- Statements and profile pages should expose useful extraction targets such as mailing address, account numbers, statement periods, and contact information.
- Use a calm, trustworthy visual design with good information hierarchy.
- Build everything as static HTML/CSS/JS with local links and no backend.

The finished portal should be realistic enough for testing extraction of financial and identity information across multiple pages.
