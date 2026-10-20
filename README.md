# 🎊 FestivaAI – GenAI Celebration & Event Planner

> **Built for Hackathon [Challenge 5]: Celebration & Event Planner**  
> *Production-grade, context-aware event architecture powered by Google Gemini, TypeScript, and Next.js.*

---

## 📌 1. Chosen Vertical

**Celebration & Event Planner** focusing on three core personas and celebration paradigms:
1. **💍 Weddings:** High-complexity ceremonies and banquets with multi-vendor dependencies, cultural traditions (Mehndi, Sangeet, Pheras), stringent guest-scaling thresholds, and high budgetary stakes.
2. **🎂 Milestone Birthdays:** Curated personal milestones (18th, 30th, 50th) requiring bespoke thematic concepts, rooftop/lounge ambiance, custom entertainment, and dietary-aware food experiences.
3. **🤝 Community Events:** Grassroots gatherings, developer summits, tech hackathons, and corporate galas needing audio-visual stage setups, speaker milestones, sponsorship ROI awareness, and mass networking catering.

---

## 🧠 2. Approach & Logic

### Context-Driven Constraint Reasoning
Traditional event planning relies on disconnected spreadsheets prone to arithmetic and communication failure. FestivaAI models event planning as an interconnected constraint-satisfaction graph:
$$\text{EventPlan} = f(\text{EventType}, \text{GuestCount}, \text{Budget}, \text{LeadTime}, \text{Theme}, \text{Cuisine})$$

- **Capital Allocation Heuristics:** Calculates spend density per guest ($\frac{\text{Budget}}{\text{GuestCount}}$) and enforces category safeguards (e.g., minimum viable venue spend ₹500/guest; catering minimum ₹300/guest).
- **Proportional Re-balancing Algorithm:** When users manually adjust any category slider (e.g., raising Catering from 35% to 45%), the remaining delta ($-10\%$) is distributed proportionally across the other 5 categories according to their weight, preventing total allocation from exceeding or falling below 100% while strictly respecting statutory floors (`minPercent`).
- **Reverse-Engineered Milestone Scheduling:** Rather than planning forward from today, the system anchors to the target event date ($T_0$) and works backwards in negative offset days ($T - 240\text{d}, T - 180\text{d}, \dots, T - 0\text{d}$). If an event date is 45 days away, higher-lead tasks are automatically marked completed or collapsed into an accelerated critical path.

---

## 🏗️ 3. How the Solution Works

### System Architecture Diagram

```mermaid
graph TD
    User([User / Event Host]) -->|Step 1: Input Constraints| IntakeForm[Intake Form & Quick Presets]
    IntakeForm -->|Client Validation & Masking| PiiMasker[PII Masker Service]
    PiiMasker -->|Cache Hash Query| LocalCache[(localStorage Hash Cache)]
    
    LocalCache -->|Cache Hit 0ms| Dashboard[Interactive Command Center]
    LocalCache -->|Cache Miss| APIRoute[Next.js Server API Routes]
    
    APIRoute -->|Server Zod Validation| Validator[Zod Schema Validator]
    Validator -->|Has GEMINI_API_KEY| Gemini[Google Gemini 1.5 Flash API]
    Validator -->|No Key / Offline| Fallback[Deterministic Fallback Engine]
    
    Gemini -->|Structured JSON Output| SchemaAudit[Zod Output Verification]
    Fallback -->|Structured EventPlan| SchemaAudit
    
    SchemaAudit -->|JSON Payload| Dashboard
    
    subgraph "Interactive Command Center (4 Connected Tabs)"
        Dashboard --> Tab1[1. Budget Architect & Re-balancer]
        Dashboard --> Tab2[2. Timeline & Run-of-Show]
        Dashboard --> Tab3[3. Vendor Checklist & Negotiator]
        Dashboard --> Tab4[4. Vibe Studio & Live AI Co-Pilot]
    end
    
    Tab4 -->|Natural Language Prompt| CoPilotAPI[/api/copilot Handler]
    CoPilotAPI -->|Dynamic Plan Patch| Dashboard
    
    Tab3 -->|1-Click Script Request| NegotiateAPI[/api/negotiation-script Handler]
    NegotiateAPI -->|Personalized Letter| Tab3
```

### End-to-End User Flow
1. **Intake & Constraint Calibration (Step 1):**
   - The user inputs their event requirements: Event Type, Guest Count, Total Budget in ₹, Target Date, City, Theme, Cuisine, and Notes.
   - Or selects one of the 3 one-click presets: *Royal Wedding (300 Guests)*, *Milestone 30th Birthday (50 Guests)*, or *Local Tech Meetup (150 Guests)*.
   - Built-in form validation blocks negative budgets, zero guests, and invalid/past dates with inline alerts.
   - All text inputs pass through `sanitizeInput()` stripping XSS vectors, SQL strings, and masking PII (Aadhaar, PAN, phone numbers, emails) before transmission.
2. **Generation & 0ms Cache Lookup:**
   - A deterministic hash key is derived from the normalized request payload (`getCacheKey()`). If identical parameters have been calculated within 7 days, the plan loads in 0ms without consuming Gemini API tokens.
   - On cache miss, `/api/generate-plan` contacts Google Gemini (`gemini-1.5-flash`), enforcing `responseMimeType: "application/json"`. If no API key is set, the deterministic fallback engine activates seamlessly.
3. **Command Center Operations (Step 2):**
   - **Budget Architect:** Interactive sliders with instant re-balancing, progress bars, underfunded category alerts, and a 300ms debounced "What-If" scale modifier.
   - **Timeline & Run-of-Show:** Reverse-scheduled milestone countdown filterable by status (*pending*, *in-progress*, *completed*) and priority (*critical*, *high*, *medium*, *low*). Check-offs persist in state with immediate velocity updates.
   - **Vendor Checklist & AI Negotiator:** Status progression tracker (*Not Started* → *Contract Locked*), budget vs actual variance monitoring, vetting questions, contract red-flag warnings, and 1-click tailored email negotiation scripts with one-touch clipboard copy.
   - **Personalized Vibe Studio & Live Co-Pilot:** 4-tone color swatches with hex codes, spatial decor architecture, dietary-compliant course menus, and invitation copy. Users can enter freeform prompts (e.g., *"Switch menu to 100% vegetarian North Indian and reduce decor budget by 15%"*) and observe the plan update live.

---

## 🛡️ 4. Security & Privacy Safeguards

- **Strict Server-Side Isolation:** The `GEMINI_API_KEY` is exclusively accessed in server-side Next.js route handlers (`/api/*`). No API keys or Gemini credentials are ever sent to client browsers.
- **Client & Server Input Validation:** Field boundaries enforced on both sides using `useFormValidation` and `zod` (`guestCount` 1–10,000, `totalBudget` ₹10,000–₹10,00,00,000, valid future dates).
- **Automated PII Stripping:** The `piiMasker.ts` service inspects all user text inputs using regular expressions for email addresses, 10-digit/international phone numbers, Indian PAN cards, and Aadhaar numbers, replacing them with redaction tokens before sending to LLM prompts.
- **Structured Schema Verification:** Incoming Gemini responses are parsed and verified using `EventPlanSchema` (`zod`), preventing prompt injection attacks or malformed JSON payloads from breaking the UI.

---

## ♿ 5. Accessibility (WCAG AAA)

- **Semantic Landmarks:** Proper semantic markup with `<header>`, `<nav>`, `<main>`, `<section>`, `<fieldset>`, `<legend>`, and `<footer>`.
- **Skip Navigation:** Top-level hidden "Skip to main content" link accessible via `Tab` key.
- **High-Contrast Dark Mode Toggle:** Switch seamlessly between light and dark palettes with full WCAG AAA compliant contrast ratios.
- **Font Size Scaler:** `A-` and `A+` toolbar controls dynamically adjust the root `rem` scaling (14px to 20px) across the entire application interface.
- **Full Keyboard Navigation:** All interactive elements feature visible focus rings (`focus-visible:ring-4 focus-visible:ring-purple-500`).
- **Screen Reader Announcements:** `aria-live="polite"` regions inform screen readers when plans are generated or updated; `aria-live="assertive"` regions announce error conditions.

---

## ⚡ 6. Repository Constraints (< 10 MB Rule)

- **Zero Heavy Assets:** FestivaAI contains **zero** PNG, JPG, WebP, MP4, or GIF media files. All visuals are rendered using `lucide-react` pure SVGs and CSS gradients.
- **Strict Git Hygiene:** `.gitignore` excludes `node_modules/`, `.next/`, `dist/`, `.env*`, and `coverage/`.
- **Repository Footprint:** The entire source code repository is **under 1 MB**, significantly below the 10 MB hackathon ceiling.

---

## 💡 7. Assumptions Made

| Dimension | Heuristic Assumption | Justification |
|:---|:---|:---|
| **Currency** | Default Indian Rupee (₹ / INR) | Tailored to Indian celebration economics with Lakhs/Crores display. |
| **Minimum Budget** | ₹10,000 baseline floor | Professional multi-vendor event coordination is unfeasible below this threshold. |
| **Vendor Ratios** | Venue 25–35%, Catering 30–35%, Decor 10–15%, Entertainment 10–15%, Photo 5–8%, Buffer 5–10% | Aligned with Indian event management industry standards. |
| **Underfunded Thresholds** | Venue < ₹500/guest; Catering < ₹300/guest | Represents baseline commercial costs for hygienic banquet dining and venue space in Tier-1/Tier-2 Indian cities. |
| **Fallback Resilience** | Deterministic local plan generation if API key is unconfigured | Evaluators and demo judges can run the entire user journey without external API keys or network latency. |
| **Cache Window** | 7-day TTL localStorage persistence | Prevents repetitive API billing when users tweak minor non-constraint details or refresh the page. |

---

## 🧪 8. Test Suite & Verification

FestivaAI includes unit tests covering core services using `vitest`:
- **`budgetMath.test.ts`:** Verifies category percentage normalization, total budget allocation summing, and underfunded threshold alerts.
- **`piiMasker.test.ts`:** Verifies detection and redaction of emails, Indian mobile numbers, PAN cards, XSS scripts, and SQL injection strings.
- **`cache.test.ts`:** Verifies deterministic hashing, object key invariance, and localStorage cache retrieval.

Run the test suite:
```bash
npm test
```

---

## 🚀 9. Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd festiva-ai
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env.local
# Add your GEMINI_API_KEY from Google AI Studio:
# GEMINI_API_KEY=your_key_here
```
*(Note: If no key is provided, the application runs on the deterministic fallback engine with 100% functionality).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm start
```
