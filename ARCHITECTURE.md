# Architecture & Design Document

This document explains the architecture, folder structure, dependency flow, and design patterns used in **StadiumOS AI**.

---

## 🏛️ 1. Architecture Overview

StadiumOS AI is structured around a **Feature-Based Modular Architecture** built on Next.js. The codebase is organized into independent feature modules that communicate through centralized state contexts.

```
┌─────────────────────────────────────────────────────────────────┐
│                           Next.js App                           │
│                          (src/app/page)                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Live Map     │     │  Command Center │     │  Dispatch Board │
│  (StadiumMap)   │     │    (AIChat)     │     │(VolunteerTasks) │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────┬───────────┴───────────┬───────────┘
                     ▼                       ▼
         ┌───────────────────┐     ┌───────────────────┐
         │ OperationsContext │     │  SettingsContext  │
         └─────────┬─────────┘     └─────────┬─────────┘
                   ▼                         ▼
         ┌───────────────────┐     ┌───────────────────┐
         │   geminiService   │     │   securityUtils   │
         └───────────────────┘     └───────────────────┘
```

---

## 📂 2. Folder Structure

The code is organized as follows:

```
src/
├── app/                  # Next.js App router page definitions & styles
│   ├── globals.css       # Core Tailwind styles, high-contrast, & font sizing rules
│   ├── layout.tsx        # Shell component injecting Context Providers
│   └── page.tsx          # Main Grid layout dashboard
├── components/           # General reusable components
│   └── ErrorBoundary.tsx # Catching rendering crashes in feature components
├── constants/            # Telemetry mock data and lists
│   └── mockData.ts       # Initial stadium operations state values
├── context/              # Centralized State Providers
│   ├── OperationsContext.tsx # Live telemetry, incidents, and volunteer tasks state
│   └── SettingsContext.tsx   # User keys, contrast, languages, and font size state
├── features/             # Feature-specific components
│   ├── accessibility/    # Accessibility mode control panel
│   ├── command-center/   # Chatbot assistant widget
│   ├── crowd-prediction/ # Recharts forecasting chart
│   ├── live-map/         # Interactive SVG stadium telemetry map
│   ├── operations/       # Key metrics banner and alert broadcasts
│   ├── transport/        # Transit schedule and parking widget
│   └── volunteer/        # Dispatch task list and task creator
├── services/             # Backend connections and utilities
│   ├── geminiService.ts  # Gemini API integration & mock AI fallback responses
│   └── securityUtils.ts  # Input sanitization and API key validation
└── types/                # Strict TypeScript interface declarations
```

---

## 🔄 3. Data & State Flow

1. **State Isolation**:
   - Telemetry data is isolated within the `OperationsProvider`. Features that render live data (like the `StadiumMap`, `VolunteerTasks`, and `OperationsDashboard`) read telemetry state from this provider.
   - User configuration details are isolated within the `SettingsProvider`.
2. **Downward Dependency Flow**:
   - Context providers do not depend on feature components.
   - Services do not depend on context providers. `geminiService` takes inputs parameters directly rather than importing contexts, obeying the **Dependency Inversion Principle**.
3. **Clean Decoupling**:
   - The SVG `StadiumMap` is fully independent. It emits custom actions by updating the `selectedElement` state locally, and visualizes route overlays passed in as props.
