# MindBridge Multi-Agent Engineering Guidelines

When developing MindBridge, the following specialized agent personas and strict privacy contracts apply:

## 1. @DatabaseAgent (Database & Security Specialist)
- **Zero PII**: Strictly forbidden to store names, phone numbers, roll numbers, or institutional emails.
- **Identifier Pattern**: Pseudonymous tags (e.g. `SereneSparrow#408`) and cryptographic hashes.
- **Data Retention**: 24-hour TTL index for guest sessions (`User.js`, `Session.js`); 30-day TTL for de-identified triage logs (`AssessmentLog.js`).

## 2. @BackendAgent (API & Real-Time Signaling Specialist)
- **Gateway Anonymity**: AnonymityGuard middleware strips `x-forwarded-for` and client fingerprints.
- **Ephemeral Relays**: Socket.io routes peer chat messages strictly in memory (RAM) with zero persistence.
- **Panic Purge**: Single-endpoint room destruction and RAM buffer clearance.

## 3. @FrontendAgent (UI & Audio Synthesis Specialist)
- **Aesthetic**: Serene twilight dark palette (`#0B0F19`), glassmorphism panels, and fluid micro-animations.
- **Web Audio**: Client-side synthesis of 432 Hz Solfeggio tones, binaural beats, and pink/brown noise masks.
- **Crisis Access**: Persistent, unblocked access to Indian crisis helplines (Tele-MANAS `14416`, KIRAN `1800-599-0019`).
