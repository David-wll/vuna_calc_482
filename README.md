# VUNA-Calc

A clean, keyboard-friendly calculator built with vanilla HTML, CSS, and JavaScript.

![CI/CD](https://github.com/YOUR_USERNAME/vuna-calc/actions/workflows/ci-cd.yml/badge.svg)

## Features

- Basic arithmetic: addition, subtraction, multiplication, division
- Utility buttons: **AC** (all clear), **CE** (clear entry)
- Sign toggle (+/−) and percentage (%)
- Calculation history panel (click any entry to reuse the result)
- Full keyboard support
- Chained operations
- Division-by-zero protection

## Project Structure

```
vuna-calc/
├── index.html
├── src/
│   ├── style.css
│   └── calculator.js
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── .gitignore
└── README.md
```

## Running Locally

No build step needed. Just open `index.html` in a browser, or serve with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## CI/CD

This project uses GitHub Actions for continuous deployment. Every push to `main` automatically deploys to the configured hosting environment.

See `.github/workflows/ci-cd.yml` for the pipeline configuration.

## License

MIT
