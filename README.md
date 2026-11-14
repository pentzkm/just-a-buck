# Just a Buck — Friday recipient update

Open `index.html` in VS Code or a browser. This is a **static website preview**: registration, live givers list, and admin controls are NOT connected yet.

## Update the current lucky nurse

Edit `config.js` and change:
- `recipientName`: current lucky nurse's public name
- `recipientNote`: optional date or description
- `recipientVenmoHandle`: e.g. `@LN938`
- `recipientLast4`: the last four digits **provided by the recipient for Venmo verification**
- `venmoUrl`: recipient's Venmo URL
- `venmoScreenshot`: optional path like `assets/current-venmo.png`

To show a Venmo screenshot: ask the host for a screenshot of the recipient's Venmo profile, crop out balances, notifications, unrelated transactions, and other private details; save it as `assets/current-venmo.png`; then set `venmoScreenshot: 'assets/current-venmo.png'` in `config.js`. The placeholder disappears automatically.

**Important:** Screenshot and Venmo handle must be verified with the current recipient. The supplied screenshot of the Facebook instructions is NOT a Venmo profile screenshot, so no Venmo screenshot has been invented.

## Weekly flow
1. Host posts one permanent GitHub Pages URL on Facebook.
2. Nurses verify Venmo username and recipient's last four digits, then gift directly in Venmo.
3. Nurses submit gift confirmation after giving (requires future backend connection).
4. Host closes entries Friday at 4:00 PM Eastern and goes live about 4:30–4:45 PM Eastern.
5. After selection and recipient approval, host updates the recipient and opens the new round (requires future admin backend).

## Privacy and launch note
Participant phone numbers are NOT published. Only chosen display names should be public after backend implementation. Do not collect real submissions until a secure backend, consent, and applicable program rules are in place. Random selection connected to monetary gifts needs legal review.

## Simplified gifting section
Only one direct Venmo gift button appears in the recipient card. The adjacent card is for the optional Venmo screenshot and verification guidance, with no duplicate gift CTA.


## Restored design / November 2026
This package preserves the supplied forest-green-and-gold site and original dollar-bill artwork.
The public Givers List uses the deployed Google Apps Script `?action=givers` endpoint.
The form is intentionally disabled: the existing Apps Script backend does not expose a secure registration POST endpoint.
Recipient and social URLs in config.js are inherited from the supplied preview and must be verified before launch.
The two fictional nurses currently visible in the public list are test data; remove or separate test entries before public launch.
Opening index.html locally can trigger browser cross-origin restrictions. Verify the live list after GitHub Pages deployment.


## Updated section order
Top hero and highlights → How the Magic Happens → single green lucky nurse/Venmo card → mission quote → gift form (preview only) → givers list → Find Your People. The redundant right-hand Venmo screenshot card was removed.
