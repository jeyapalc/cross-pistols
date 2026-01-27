## 2024-01-27 - AudioContext Reuse
**Learning:** Browsers have a strict limit on hardware audio contexts (often ~6). Creating a new context for every sound effect (beep) without closing it leads to resource exhaustion and silent failures in long sessions.
**Action:** Always implement a singleton pattern for AudioContext in web apps.
