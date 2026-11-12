# Mordoku Progress Tracker

Kleine React-App, mit der sich Mordoku-Fortschritt lesen lässt. Schreiben geht nur mit einem GitHub Fine-Grained PAT und landet direkt in `public/progress.json` auf `main`. Jeder Push auf `main` baut die Seite über GitHub Actions neu und veröffentlicht sie auf GitHub Pages.

## Lokal

```bash
npm install
npm run dev
```

Der Produktionsbuild nutzt TypeScript 7 (`tsc` aus `@typescript/native`). ESLint hängt an der TypeScript-6-API, weil TypeScript 7.0 noch keine Compiler-API für `typescript-eslint` mitbringt. Beide liegen nebeneinander im Projekt.

## GitHub Pages

Im Repository unter Settings → Pages als Source **GitHub Actions** wählen. Das Repository muss öffentlich sein. Die Seite liegt danach unter `https://sners03.github.io/mordoku-progress-tracker/`.

Nach einem Speichern in der App dauert es etwa 30–60 Sekunden, bis der neue Stand öffentlich sichtbar ist.

## Admin-Token

Fine-Grained PAT mit Lese- und Schreibrecht auf Contents von `Sners03/mordoku-progress-tracker`. Die App speichert das Token nur im `localStorage` dieses Browsers. Owner, Repo und Dateipfad stehen in `src/config.ts`.
