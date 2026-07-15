---
tags:
  - agent-context
---

## tags: agent-context updated:

# Coding Preferences

> This note is meant to be read by AI coding agents (Claude Code, Cursor, etc.) as context on how I like to work. Keep it factual and current — update it whenever you notice a real pattern, don't guess ahead of the evidence.

## Stack Defaults
- React Native/Expo, React Navigation, Zustand, NativeWind — mobile
- React.js, Next.js, Tailwind, TypeScript — web frontend
- Node.js/Express — backend
- PostgreSQL (default) or MongoDB (flexible schema) — data
  - MySQL: not a default, only if a project explicitly requires it
- Firebase — auth/storage services as needed
- Java (OOP), SQLite, Room, Retrofit — Android-native work
- Python/SQL — data & scripting
## Website Styles Reference

> Use this to pick a visual direction when building pages/sites. If the context doesn't clearly call for one, ASK the user which style they want before proceeding — don't default silently.

### Minimalism
- Few elements, no decorative details, lots of negative space, minimal bold color
- **Use for:** personal portfolios (calm/professional), product landing pages, photography sites

### Brutalism & Neobrutalism
- Provocative layouts, clashing color palettes, heavy shadows and outlines
- **Use for:** creative/design portfolios, personal branding that wants to stand out, art/agency sites

### Constructivism
- Sans-serif fonts, geometric shapes, elements aligned to one side
- **Use for:** bold statement pages, event/campaign pages, political or activism-style sites

### Swiss Style
- Strong modular grid, clean sans-serif fonts, minimal realistic photos/illustrations, poster-inspired composition
- **Use for:** editorial/blog layouts, design studio sites, structured content-heavy pages

### Editorial Style
- Print-inspired, high contrast fonts, large visuals, decorative elements
- **Use for:** portfolios (writing/creative/photography), magazine-style blogs, case study pages

### Hand-drawn Style
- Handwritten/script fonts, sketches, brush strokes, free-form layout
- **Use for:** playful personal sites, kids/education products, craft or artisanal brands

### Retro
- Bright palettes and gradients, grainy textures, old-school tech-inspired elements
- **Use for:** music/entertainment sites, nostalgic branding, event pages with a fun tone

### Flat
- Total flatness, no shadows/3D, pastel tones, clean readable fonts
- **Use for:** SaaS/dashboard UIs, productivity apps, general clean web apps

### Bento
- Rectangular rounded content blocks, little empty space, no decorative tricks
- **Use for:** product/feature showcase pages, marketing sites, dashboards with lots of distinct info

---

### Default Behavior
- **Portfolio page, no style specified:** default to Brutalism or Editorial
- **Any other page type with no style specified:** ASK the user which style to use before proceeding — do not silently pick one

## Patterns I Like

- Write clean code — readable and simple over clever
- Keep it DRY (Don't Repeat Yourself)
- Comment the "why," not the "what" — code should explain itself; comments explain reasoning/context
- Single Responsibility — each function/component does one thing well
- Consistent formatting — follow the project's existing conventions, don't introduce new ones mid-file
- Small, focused commits/functions over large monolithic ones
- Descriptive naming over comments — a good variable/function name beats explaining a bad one

## Things I don't like

### UI/Visual
- No emoji as icons — use a proper icon source (favicon, icon library, SVG)
- No gradients unless explicitly specified
- No excessive box-shadow on everything by default
- No default rounded-corners-on-everything (12px+ border-radius) unless specified
- Don't center everything by default — respect intended alignment
- Use a consistent spacing scale, not arbitrary magic numbers
- No placeholder text (Lorem ipsum, "Your Content Here") left in final output
- No generic AI-flavored hero sections unless it fits the product

### Responsiveness
- No broken mobile responsiveness — test/consider breakpoints, not just desktop
- No fixed pixel widths causing overflow on small screens
- No unintended horizontal scroll on mobile
- Touch targets must be usable size on mobile

### Code Structure
- No premature abstraction — don't create generic hooks/wrappers before 2+ real use cases
- No excessive comments explaining obvious code
- No deeply nested ternaries — use early returns
- Keep naming conventions consistent within a file
- No excessive defensive try/catch around operations that can't realistically fail
- Don't reinvent something a well-known library already solves
- Split large components logically, don't leave massive single files
- Remove unused imports/variables
- Remove console.logs before finalizing

### Naming/Content
- No generic variable names (`data`, `item`, `temp`) — use descriptive names
- No AI-flavored marketing copy ("Unlock the power of...", "Seamlessly integrate...")
- No placeholder names (`MyComponent`, `NewFeature`) left in final code

### Architecture
- Don't add state management libraries for state that fits local component state
- Don't create a generic "utils/helpers" dumping ground — organize by feature
- Don't overengineer folder structure before complexity is earned

## Testing / Workflow Habits

- Plan the logic first before writing code — avoid spaghetti code from jumping straight in
- Build and test incrementally — don't write large chunks of untested code at once
- Manage workflow — break tasks into clear steps, track what's done vs pending
- When an error occurs, trace it back to the actual source — don't patch symptoms without understanding root cause
- Verify assumptions before building on top of them
- Prefer fixing the root cause over adding workarounds

## Communication Preferences (for agent output)

- **Pull Requests:** Always provide a thorough description outlining what the PR does and why it was built
- **Code Reviews:** Be specific and clear; distinguish between optional suggestions ("nits") and blocking requirements
- **Design Docs:** Write clear, concise architectural documents that define the problem, proposed solution, and tradeoffs
- **Bug Reports:** Provide exact steps to reproduce, actual behavior vs. expected behavior, logs, and screenshots
- **Technical explanations:** Translate technical work into output and impact — explain what changed and why it matters, not just what was done
## Git & Commit Conventions

- Commit style: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, etc.)
- Keep commits small and focused — one logical change per commit
- Branch naming: `type/short-description` (e.g. `feat/user-auth`, `fix/login-crash`)
- No committing directly to main — always via PR

## Tooling Conventions

- Package manager: npm, pip, ask if not mentioned
- Formatter/linter: follow the project's existing ESLint/Prettier config — don't introduce a new one
- Don't reformat unrelated code while making an unrelated change (keep diffs clean)

## Error Handling & Logging

- Errors should be handled explicitly, not swallowed silently
- Prefer structured/contextual error messages over generic ones
- No leftover `console.log` — use a proper logger if one exists in the project
- React: use error boundaries where appropriate instead of letting crashes propagate silently

## Security Basics

- Never hardcode secrets, API keys, or credentials — always use environment variables
- Validate and sanitize user input, especially on backend endpoints
- Don't disable security features (CORS, auth checks, etc.) to "make it work" — flag the issue instead

## Accessibility Baseline

- Use semantic HTML elements over generic `div`/`span` where applicable
- Images require meaningful `alt` text
- Interactive elements must be keyboard-navigable
- Sufficient color contrast — don't rely on color alone to convey meaning

## API & Naming Conventions
See [[API and Naming Conventions]] for the full spec (REST endpoints, response shapes, TypeScript/React/DB naming, project structure).
## Documentation Habits

- Update the README when a PR changes setup, usage, or public-facing behavior
- Use docstrings/JSDoc for non-obvious functions, not every function
- Keep documentation close to the code it describes rather than a separate wiki, when possible

## Agent Autonomy Boundary

> When to just proceed vs when to stop and ask first.

**Proceed without asking:**
- Bug fixes within existing logic
- Following established patterns already in the codebase
- Refactors that don't change behavior

**Stop and ask first:**
- Adding a new dependency/library
- Changing database schema
- Introducing a new architectural pattern (e.g. new state management approach)
- Deleting or significantly restructuring existing files
- Any decision affecting multiple projects/repos

## Related Reference Notes
- [[Reference/Environment versions.md|Environment versions.md]] — exact dependency versions
- [[Reference/Project scaffold.md|Project scaffold.md]] — how to start a new project
- [[Common Error fixes]] — known gotchas by tool