# Vite + React + TypeScript Template

An opinionated starter template for React projects with TypeScript, Vite, and Sass.

## What's Included

- **React** with `wouter` (lazy loading, error boundary)
- **TypeScript** with strict mode. `tsc` is TypeScript 7 (the `typescript-7` package); `typescript` is the TypeScript 6 package, because typescript-eslint doesn't support 7 yet.
- **Sass** (SCSS) with a minimal reset and CSS custom properties (light/dark via `prefers-color-scheme`)
- **ESLint** flat config with `typescript-eslint`, `react-hooks`, and `react-refresh` plugins
- **pnpm** as the enforced package manager

## Project Structure

```
public/                      favicons, served as they are
src/
├── Context/
│   ├── ThemeContext.tsx     THEMES is the source of truth for themes
│   ├── ThemeToggle.tsx      passed to <Navbar actions={...} />, not imported by it
│   └── ThemeToggle.scss
├── components/
│   ├── Nav/
│   │   ├── Navbar.tsx       hero/solid modes, isShrunk, actions slot
│   │   ├── NavDrawer.tsx    slide-in drawer, supports nested panels
│   │   ├── nav.config.ts    all nav data + isRouted (edit this)
│   │   └── Navbar.scss      styles for both
│   └── ErrorBoundary.tsx
├── pages/
│   ├── Home/                renders <Navbar isHero />
│   ├── About/               lazy-loaded, as an example of a code-split route
│   └── NotFound/            the <Switch> fallback
├── index.scss               reset, theme palettes, CSS custom properties
└── main.tsx                 routes, providers, ScrollToTop
```

The two files you'll touch first are **`nav.config.ts`** (navigation is data) and **`index.scss`** (the palette). Routes are registered as `<Route>`
children of the `<Switch>` in `main.tsx`.

Four tsconfigs: `tsconfig.json` only holds `references`,
`tsconfig.base.json` holds the option shared by the other two, and
`tsconfig.app.json` / `tsconfig.node.json` keep only what's specific to each.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Scripts

| Command         | Description                      |
|-----------------|----------------------------------|
| `pnpm dev`      | Start dev server                 |
| `pnpm build`    | Lint, type-check, and build      |
| `pnpm preview`  | Preview production build locally |
| `pnpm lint`     | Run ESLint                       |
| `pnpm lint:fix` | Run ESLint with auto-fix         |

## Customization

- **Styles**: Edit `src/index.scss` to change the colors, fonts, or add variables. You can add individual component-level `.scss` files as you expand the site.
- **Routing**: Add new pages in `src/pages/` and register `<Route>`s inside the `<Switch>` in `main.tsx`. Use `lazy()` + `<Suspense>` for code-split routes.
- **Context providers**: Wrap `<Switch>` in `main.tsx` with any context providers you need (e.g. theme, auth).

## Spacing content below the navbar

The navbar is `position: fixed`, so it floats above your content and doesn't take up layout space. Content at the top of a page will slide underneath it unless
you offset it.

Add a spacer once, wherever you render `<Navbar />`:

```tsx
<Navbar />
<div className="nav-spacer" />
```

```scss
// index.scss
.nav-spacer {
    height: calc(56px + 2rem + env(safe-area-inset-top));
}
```

The height matches the navbar's at-rest size: the `56px` bar plus its `1rem` top/bottom padding plus the safe-area inset. The bar shrinks on scroll, but since
it's fixed the spacer only needs to clear the initial height.

For hero pages (`<Navbar isHero={true} />`), you can skip the spacer so the transparent bar sits over the hero content.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it,
see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...

            // Remove tseslint.configs.recommended and replace with this
            tseslint.configs.recommendedTypeChecked,
            // Alternatively, use this for stricter rules
            tseslint.configs.strictTypeChecked,
            // Optionally, add this for stylistic rules
            tseslint.configs.stylisticTypeChecked,

            // Other configs...
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x)
and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            // Other configs...
            // Enable lint rules for React
            reactX.configs['recommended-typescript'],
            // Enable lint rules for React DOM
            reactDom.configs.recommended,
        ],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            // other options...
        },
    },
]);
```