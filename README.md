# StadiumOS AI — FIFA World Cup 2026 Smart Stadium Command Center

StadiumOS AI is a next-generation Stadium Operating System and Command Center designed to streamline operations and ensure fan safety during the high-stakes FIFA World Cup 2026 matches. Built using Next.js (App Router), Tailwind CSS, Framer Motion, and the Gemini API, it provides intelligent real-time insights to stadium managers, dispatchers, volunteers, and accessibility assistants.

---

## 📋 Problem Statement

During major global tournaments like the FIFA World Cup 2026, stadiums experience massive crowd densities, safety incidents, and transit bottlenecks. Traditional systems rely on legacy voice dispatches or basic chatbots, failing to provide predictive intelligence or dynamic routing overlays for fans with diverse accessibility requirements.

**StadiumOS AI** bridges this gap by acting as an **Intelligent Command Center** that:
1. **Unifies Operational Telemetry**: Aggregates crowd stand metrics, gate lines, and transit dispatch onto an interactive dashboard.
2. **Speeds Up Crisis Mitigation**: Deploys AI-generated tasks to volunteer networks based on real-time incidents.
3. **Enhances Fan Accessibility**: Re-calculates walking routes (wheelchair ramps, low-vision guides, senior-friendly steps) based on active queue lines.
4. **Predicts Bottlenecks**: Computes wait-time forecast curves through the game cycle.

---

## ⚡ Core Features

1. **AI Command Center (Multilingual Assistant)**
   - Contextual chat interface that parses current stadium state (incidents, transit delays, queue capacities) to respond to query prompts.
   - Built-in on-the-fly translation for 5 FIFA World Cup languages: English, Español, Français, Português, and العربية.
2. **Interactive Live SVG Map**
   - Dynamic stadium map showing stand sectors highlighted by heat densities (Low, Medium, High, and pulsing Critical).
   - Animated SVG flow lines overlaying specialized routes (Wheelchair Ramps, Stroller Paths, Senior Walks, and Tactile Guide Corridors).
3. **Crowd Prediction Dashboard**
   - Recharts visual Area graphs forecasting wait times (up to 3 hours ahead) through final whistle flows.
   - **AI Explanation Engine** that generates written briefings predicting congestion peaks.
4. **Volunteer & Operations Dispatch Boards**
   - Real-time KPI decks (total crowd count, power load, active dispatches, waste level indices).
   - Automated task scheduler that creates helper assignments based on active incidents (e.g. ticket reader failure, medical dispatch).
5. **Transport Planner & Walking Advisor**
   - Tracks public transit departures (Red Line Metro, buses, shuttle loops) and parking lot occupancies.
   - Directs fans to less-crowded entry points to balance queues.
6. **WCAG 2.2 AA Compliance Panel**
   - Custom toggles to scale typography sizes, enforce high contrast dark colors, read texts out loud (browser SpeechSynthesis), and switch the AI's terminology to simple English modes.

---

## 🛡️ Security Architecture

- **Zero-Key Server Storage**: The Gemini API key is collected purely client-side, saved directly inside the browser's `localStorage`, and never sent to a server.
- **Client-to-API Calls**: Connects directly from the browser window using standard fetch, preventing key leakage in backend node logs.
- **Graceful Fallbacks**: If the user leaves the API key empty, the assistant defaults to a simulated offline model that matches keywords to return realistic responses, ensuring the app is fully reviewable.
- **Input Sanitization & XSS Prevention**: Input text fields (emergency broadcasts, chatbot queries, volunteer tasks) are sanitized and HTML-encoded to prevent XSS and HTML injection vulnerabilities.
- **API Key Format Validation**: The system validates Gemini API key format (starts with `AIzaSy` and is 39 characters long) before attempting calls or saving to storage.
- **Secrets Auto-Redaction**: A secure filter scans all error messages and terminal output logs to redact API keys (`[REDACTED_API_KEY]`), preventing credential leakage.

---

## 📂 Folder Structure

```
src/
├── app/                  # App router pages, global styles, page containers
├── components/           # Core design components
├── context/              # Settings Context (localStorage), Operations Context (simulators)
├── features/             # Feature-first modules (map, chat, dashboards, prediction)
│   ├── accessibility/    # Accessibility panels and options toggles
│   ├── command-center/   # Multilingual chat assistants
│   ├── crowd-prediction/ # Recharts forecasting lines
│   ├── live-map/         # Interactive SVG grids and routes
│   ├── operations/       # Stadium managers KPI console
│   ├── volunteer/        # Dispatch task creation lists
│   └── transport/        # Parking and metro schedules
├── services/             # client-side geminiService.ts
├── types/                # Types definitions index.ts
└── constants/            # Mock database states and query arrays
```

---

## 🧪 Testing Suite

We use **Vitest** and **React Testing Library** for test execution.

```bash
# Run the automated tests once
npm run test
```

Our tests verify:
- **`operations.test.tsx`**: Checks that adding/resolving incidents and assigning volunteer tasks performs correct reducer transformations.
- **`settings.test.tsx`**: Assures that setting changes (API key, high contrast, languages) save to local storage.
- **`gemini.test.ts`**: Assures mock responses match keywords, translate to Spanish correctly, and simplify vocabulary in simple language mode.
- **`security.test.ts` [NEW]**: Verifies HTML encoding for XSS prevention, API key pattern checks, and secret redaction.
- **`accessibility.test.tsx` [NEW]**: Verifies SVG map focusable elements (stands, gates, facilities), keypress triggers, and SettingsContext UI toggle integrations.

---

## ♿ Accessibility & Performance Optimization

- **WCAG 2.2 AA Compliance**: The interactive SVG Stadium Map has been fully upgraded for accessibility. All stands (`path`), facilities (`g`), and gates (`g`) contain custom focus-visible ring outline styles, are keyboard focusable (`tabIndex={0}`), have accessible roles (`role="button"`), support keyboard interaction (`Enter` or `Space` key triggers selection), and provide semantic labels (`aria-label`) for screen readers.
- **Lazy-Loaded Recharts Bundles**: The Recharts-based `PredictionChart` is dynamically imported with server-side rendering disabled (`{ ssr: false }`), preventing Next.js hydration mismatch warnings and decreasing the main bundle size.
- **Component Memoization**: Static and expensive objects (like the `facilities` array and `languages` metadata) are memoized (`useMemo`) or declared outside the component renders to avoid unnecessary re-rendering and garbage collection.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### Running Locally
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the smart stadium operations command deck.

### Production Build
Verify the production build:
```bash
npm run build
```
The build has been fully verified and compiles successfully with zero warnings or errors.
