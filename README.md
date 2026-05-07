# foreverpredestined.love local rebuild

This workspace contains a local mirror of `https://www.foreverpredestined.love/` using the live production build output (React/Next.js compiled assets), including:

- HTML structure
- CSS styling
- JS bundles (animations and interactions)
- Images, fonts, and icon assets

## Files

- `index.html`
- `/_next/static/...`
- `/images/...`
- `/gallery/...`
- `/icon.svg`

## Run locally

Use any static server from this folder. Example:

```bash
python3 -m http.server 4173
```

Then open:

`http://localhost:4173`

## Notes

- This is an exact production mirror, so animations are preserved via the downloaded JS bundles.
- If you want a fully editable React source-code version (component-by-component), I can build that next as a second phase.
