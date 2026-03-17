# ☕ JavaDrill

**Duolingo-style Java interview prep — gamified learning with streaks, XP, and achievements.**

A single-page web app that helps you prepare for Java technical interviews through bite-sized, interactive quiz sessions. No backend required — runs entirely in your browser.

## Features

**5 Question Types:**
- 🔘 Multiple choice (pick 1 of 4)
- ✅ True / False with explanations
- ✏️ Fill in the blank
- 🔢 Arrange in correct order
- 🔗 Match pairs

**9 Categories, ~100 Questions:**
- Core Java, OOP, Collections, Concurrency, JVM Internals, Exceptions, Java 8+, Design Patterns, Spring

**Full Gamification:**
- 🔥 Daily streaks
- ⚡ XP & leveling system (Novice → Distinguished)
- ❤️ 3 lives per session
- 🎯 Daily goals (5 correct answers/day)
- 🏆 18 unlockable achievements
- 📊 Per-category progress tracking
- 👤 Profile page with lifetime stats

**Tech Stack:**
- React 18 + Vite
- Zero backend — localStorage for persistence
- Deployable to GitHub Pages

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages → Source** and select **GitHub Actions**
3. Every push to `main` auto-deploys via the included workflow

> **Note:** If your repo name isn't `javadrill`, update the `base` path in `vite.config.js` to match your repo name.

Your app will be live at `https://<username>.github.io/javadrill/`

## Adding Questions

All questions are in the `Q` array in `src/App.jsx`. Each question follows one of these formats:

```js
// Multiple choice
{ id: "c01", cat: "core", diff: 1, type: "pick1of4",
  q: "Your question with `code`?",
  options: ["A", "B", "C", "D"], answer: 0 }

// True/False
{ id: "c02", cat: "core", diff: 1, type: "truefalse",
  q: "Statement to evaluate.",
  answer: false, explanation: "Why it's false." }

// Fill in the blank
{ id: "c03", cat: "core", diff: 2, type: "fillblank",
  q: "Use the `____` keyword to do X.",
  answer: "final", accept: ["final", "Final"] }

// Order
{ id: "c04", cat: "core", diff: 2, type: "order",
  q: "Arrange in correct order:",
  items: ["First", "Second", "Third", "Fourth"],
  correctOrder: [0, 1, 2, 3] }

// Match pairs
{ id: "c05", cat: "core", diff: 2, type: "match",
  q: "Match left to right:",
  pairs: [{ l: "Term", r: "Definition" }, ...] }
```

Categories are defined in the `CATEGORIES` object. `diff` is 1-3 (affects XP earned).

## License

MIT
