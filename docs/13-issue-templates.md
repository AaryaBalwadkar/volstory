# 11. GitHub Issue Templates & Triage

> **"A well-defined issue is a problem half-solved."**

To maintain discipline in our VolStory codebase, we strictly enforce the use of GitHub Issue Templates. These templates ensure that before a developer writes a single line of code, the *why*, the *who*, and the *Acceptance Criteria (AC)* are fully documented and approved.



When creating a new issue, GitHub will prompt you to select one of the following templates. **Do not delete the template headers or sections.**

---

### 🐛 1. Bug Report (`01-bug-report.md`)
**Use this for:** Crashes, UI glitches, or unexpected behavior.

* **🐛 Bug Context:** Explain *what* is broken and *who* it affects (e.g., "Volunteers cannot see their shift times").
* **👣 Steps to Reproduce:** List the exact clicks needed to trigger the bug. **If we cannot reproduce it, we cannot fix it.** If the bug relates to network loss, explicitly state to test in Airplane Mode.
* **📱 Environment Details:** React Native behaves differently across devices. Always include the OS (iOS/Android) and device model.
* **📸 Visual Proof:** A screenshot or Metro bundler crash log is mandatory.

---

### 🚀 2. Feature Request (`02-feature-request.md`)
**Use this for:** Proposing new workflows for volunteers, coordinators, or admins.

* **🚀 Context:** Why does the temple need this? What problem does it solve?
* **✅ Acceptance Criteria (AC):** A strict, testable checklist of what defines this feature as "Done." This must include an offline-behavior requirement.
* **🎨 Figma Reference:** You must link to the approved Figma design. We do not code without designs.
* **💣 Technical Risks:** Note if this requires database changes or new native SDKs.

---

### ♻️ 3. Tech Debt / Chore (`03-tech-debt.md`)
**Use this for:** Internal developer tasks, CI/CD updates, refactoring, or performance boosts.

* **🎯 Objective & Rationale:** Why spend engineering time on this? (e.g., "Migrating to FlashList to fix lag on the Seva screen").
* **⚡ Impact Assessment:** You must check the boxes justifying the ROI (Return on Investment) of this task—whether it improves app speed, reduces bundle size, or tightens security.

---

### 🎨 4. UI/UX & Style Update (`04-ui-update.md`)
**Use this for:** Minor styling tweaks, NativeWind class adjustments, or asset updates where NO business logic is changed.

* **🎨 Design Context:** What is changing? (e.g., "Dark mode contrast on the login button is too low").
* **📸 Figma Reference:** Link directly to the exact Figma frame.
* **✅ Acceptance Criteria:** Verify that the UI works on both Light/Dark modes, handles large accessibility fonts, and does not break when the mobile keyboard opens.