# Student Invoice & Payment Receipt

A zero-backend static HTML/CSS/JavaScript project.

## Features

- Seller enters student/payment details.
- Generates a professional invoice as a PNG image.
- Generates a unique payment URL containing the invoice data.
- Customer opens the payment URL.
- Customer can copy the payment phone number.
- Customer clicks "I Have Paid" and gets a payment receipt PNG.
- Receipt can be downloaded or shared with the phone's native share sheet where supported.
- No database, server, email service, or API key is required.

## Files

- `index.html` — seller invoice generator
- `pay.html` — customer payment and receipt page
- `css/style.css` — responsive styling
- `js/common.js` — image generation and shared utilities
- `js/invoice.js` — seller-side logic
- `js/payment.js` — customer-side logic

## Deploy for free

### GitHub Pages

1. Create a GitHub repository.
2. Upload all files/folders from this project.
3. In GitHub, open Settings → Pages.
4. Select "Deploy from a branch".
5. Select your main branch and `/ (root)`.
6. Save.

Your site will get a URL such as:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`

### Cloudflare Pages

1. Create a Cloudflare account.
2. Create a Pages project.
3. Connect the GitHub repository.
4. Deploy with no build command.

## Important security/design note

The payment page does NOT process or verify money. It only displays the payment number and creates a receipt-submission image after the customer says they have paid.

The seller should verify the actual incoming payment before treating the invoice as paid.

The invoice details are encoded in the payment URL. This is intentionally simple and requires no database, but the URL should not be treated as secret information.

## Customization

Change the payment phone field on the seller page for each invoice.

To add a fixed seller phone number, logo, business name, QR code, colors, or additional invoice fields, edit `js/common.js` and `css/style.css`.
