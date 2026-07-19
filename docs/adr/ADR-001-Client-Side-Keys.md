# Architectural Decision Record (ADR)

## ADR-001: Client-Side Gemini API Key Storage and Communication

---

### Context & Problem Statement

StadiumOS AI requires access to the Google Gemini API to analyze stadium telemetry (such as wait times, congestion, and incidents) and generate natural language recommendations for operations commanders.
Traditional architectures store API keys on backend servers. However, this application is designed as a decentralized, standalone command deck running directly in client environments. The deployment of a separate backend server solely to proxy LLM requests introduces complexity, operational cost, and additional latency.

We need to decide:
1. Where to store the Gemini API keys securely.
2. How to dispatch requests to the Gemini API without exposing the key to unauthorized parties.

---

### Decision Drivers

* **Security**: API keys must not be leaked in version control or stored in centralized databases.
* **Latency**: Minimize round-trips for real-time telemetry analysis.
* **Simplicity**: Maintain a clean, standalone frontend build architecture easily deployable to static hosts.
* **Data Ownership**: Ensure individual venues own and control their API usage and keys.

---

### Considered Options

1. **Option A: Backend Proxy Service**
   - Store keys in backend environment variables.
   - Proxy all frontend requests through the backend.
2. **Option B: Client-Side Input & Storage (Selected)**
   - Let operations commanders input their own Gemini API key directly into the settings dashboard.
   - Store the key exclusively in the browser's `localStorage`.
   - Dispatch requests directly from the client browser to the Google Gemini API.

---

### Decision Outcome

**Chosen Option: Option B (Client-Side Input & Storage)**

We selected Option B because it aligns with a decentralized, serverless architecture where individual browsers manage keys and make direct API requests.

#### Conforming Security Measures Implemented:
1. **No Backend Middleman**: The key is never dispatched to any server other than Google's Gemini API endpoints (`https://generativelanguage.googleapis.com`).
2. **LocalStorage Security**: Keys are stored locally inside the browser's `localStorage` namespace (`stadium_os_settings`), which is isolated per domain origin.
3. **Format Checks**: A regular expression regex is applied at the input gate (`isValidGeminiApiKey`) to block malformed inputs.
4. **Log Redaction**: Any error messages captured in catching boundaries are parsed to scrub and redact key patterns `AIzaSy...` before logging to the console.
5. **Content Security Policy (CSP)**: The CSP header restricts API connections (`connect-src`) to only `self` and `generativelanguage.googleapis.com`, preventing malicious scripts from exfiltrating the key.

---

### Consequences

* **Good**: Zero backend operational costs or server configurations needed.
* **Good**: Direct client-to-API network calls reduce response latency.
* **Neutral**: Users must configure their own API keys; if left empty, the application gracefully falls back to local simulation scripts without throwing errors.
* **Neutral**: If `localStorage` is cleared, users must input their key again.
