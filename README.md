# 🧠 DeMentor: Autonomous Multi-Agent Medication Adherence & Memory Companion

A modern, full-stack Next.js 15 clinical intelligence and memory care platform designed for geriatric patients and their care teams. DeMentor delivers personalized routine coaching, ChromaDB vector search over clinical monographs, multi-agent empathetic conversations, and real-time Telegram Bot medication reminders with 4-button interactive adherence tracking.

---

## ✨ Features

- **🧠 Multi-Agent Clinical AI Architecture:**
  - **Clinical Safety Guardrail Agent:** Intercepts red-flag emergency symptoms (syncope, acute bradycardia, severe dizziness) and triggers immediate clinical escalations.
  - **Knowledge & Monograph RAG Agent:** Semantic search over curated FDA monographs (Donepezil, Galantamine, Rivastigmine, Memantine).
  - **Empathy & Memory Coach Agent:** Gentle, clear, large-print conversational guidance tailored to cognitive care.
  - **Intake & Routine Calibration Agent:** 7-step clinical intake wizard dynamically calculating BMI, dose timing, and personalized daily routines.
- **🤖 Telegram Smart Reminder Bot (`@BversityCareBot`):**
  - Sends scheduled medication reminders directly to patient & caregiver Telegram accounts.
  - **Interactive 4-Button Inline Keyboard:**
    - `[✅ Taken]` $\rightarrow$ Automatically marks dose as taken in backend routine & growth garden.
    - `[⏰ Snooze 15 min]` $\rightarrow$ Snoozes reminder for 15 minutes.
    - `[❓ Not sure]` $\rightarrow$ Safe clinical monograph guidance (No-Double-Dose rules).
    - `[❌ Missed]` $\rightarrow$ Logs missed dose and reinforces safe resumption.
- **🔐 User-Scoped Data Isolation:**
  - Independent persistent storage per user account (`user_id`).
  - Pre-configured 1-tap demo account for **Afreen** (`afreen@example.com` / `afreen123`).
  - Clean, fresh state for new registrations with zero pre-filled dummy data.
- **⚡ 100% Next.js 15 Serverless App Router:**
  - Zero external backend server dependencies.
  - Ready for 1-click deployment on **Vercel**.

---

## 🚀 Quickstart & Conda Environment Setup

### 1. Create and Activate the Conda Environment
```bash
# Option A: Using environment.yml
conda env create -f environment.yml
conda activate aegiscare

# Option B: Manual creation
conda create -n aegiscare python=3.11 -y
conda activate aegiscare
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-small-latest
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=BversityCareBot
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🤖 Telegram Bot Quick Setup
1. Open Telegram and search for **[@BversityCareBot](https://t.me/BversityCareBot)** or visit `https://t.me/BversityCareBot`.
2. Click **Start** or send `/start`.
3. In the AegisCare web app, click **"Telegram Reminders"** in the top navigation bar or trigger test reminders from the Caregiver Portal.

---

## 📂 Project Structure
```
├── app/
│   ├── api/
│   │   ├── adherence/          # Medication routine & mark-taken endpoints
│   │   ├── agent/              # Multi-agent status & step runners
│   │   ├── auth/               # User authentication & registration
│   │   ├── chat/               # Clinical AI reasoning & Mistral RAG fallback
│   │   ├── documents/          # Clinical monograph index & search
│   │   ├── escalation/         # Emergency dispatch & audit logs
│   │   ├── intake/             # 7-step intake profile calibration
│   │   ├── profile/            # User-scoped clinical profiles
│   │   └── telegram/           # Bot send-reminder, webhook & polling
│   ├── layout.tsx              # Root Next.js layout & Google font imports
│   └── page.tsx                # Single-page application entry point
├── components/                 # Reusable UI widgets & modals
├── lib/
│   ├── ai/                     # Multi-agent clinical reasoning engine
│   ├── context/                # PatientContext state provider
│   ├── services/               # Telegram Bot API service
│   ├── stateStore.ts           # In-memory per-user storage engine
│   └── types/                  # TypeScript domain models
├── pages_components/           # Primary view tabs (Dashboard, Chat, Caregiver, etc.)
├── environment.yml             # Conda environment specification
├── requirements.txt            # Python dependencies
└── package.json                # Next.js & React dependencies
```

---

## 📄 License
MIT License. Built for healthcare innovation and caregiver empowerment.
