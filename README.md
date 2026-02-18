# GesundGeht 2026

Static marketing website for GesundGeht nutrition coaching.

## Stack
- HTML
- CSS
- Vanilla JavaScript

## Main files
- `index.html`
- `ueber-mich.html`
- `kontakt.html`
- `teilnahmebedingungen.html`
- `partner.html`
- `impressum.html`
- `datenschutz.html`
- `styles.css`
- `script.js`
- `assets/`

## Run locally
```bash
cd /Users/slydog/Desktop/gesundgeht2026
python3 -m http.server 8080
```

Open:
- `http://localhost:8080/index.html`

## Upload to GitHub
1. Create a new empty GitHub repository.
2. Run:

```bash
cd /Users/slydog/Desktop/gesundgeht2026
git init
git add .
git commit -m "Initial website showcase"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Optional: GitHub Pages
If you want a public demo URL:
1. Open repository `Settings -> Pages`.
2. Set source to `Deploy from a branch`.
3. Select branch `main` and folder `/ (root)`.
