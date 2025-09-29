
Eden Garden — Notes about changes and Telegram auto-send
=======================================================

What I changed (only what you requested):
- Added 5+ products to categories: Birthday, Summer, Gift, Sympathy.
- Added a new "New Arrivals" category (5 items) and the "Shop New Arrivals" button links to it.
- Converted all displayed prices to US dollars ($) and updated product prices in `data/products.json`.
- Added `privacy.html` and `terms.html` pages and updated footer links.
- Fixed mobile navbar disappearing by adding a small CSS tweak to `css/home.css` and `css/products.css`.
- The checkout button opens Telegram with a prefilled message showing product name, quantity and price.
  The message is built to use `window.store.formatPrice()` so it will show dollar amounts correctly.

Important limitation about automatic sending to Telegram:
- Browsers cannot programmatically send messages on behalf of the user in the Telegram *client app* for security reasons.
  The site can open a Telegram deep link with a prefilled message (this is implemented). The user still must tap "Send" in the Telegram app.
- If you require the message to be sent automatically (server->merchant without user tapping send), you'll need a small server that uses the Telegram Bot API
  or sends messages through a merchant account. I included an OPTIONAL webhook mechanism in `js/cart.js`:
  - Set `OPTIONAL_WEBHOOK_URL` to a server endpoint you control. The frontend will POST the order (message and total) to that endpoint,
    and the server can then call Telegram's Bot API to send the message automatically to the merchant or store it.
  - I didn't create a server here to avoid changing features you didn't ask for. If you'd like, I can provide example server code (Node/Express)
    that receives the POST and sends the message via a Telegram bot.
