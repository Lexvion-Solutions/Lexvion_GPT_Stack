# Demo Readiness Plan — Lexvion GPT Stack

Goal: be investor‑demo ready on Windows in under 30 minutes.

---

## 0) Windows machine setup (Node 20 with NVM)

1. Ensure NVM is installed:
   - File must exist: `C:\Program Files\nvm\nvm.exe`
   - If `nvm` is not recognized:
     - Open: **Start** → type `Environment Variables` → **Edit the system environment variables** → **Environment Variables…**
     - In **System variables** → select **Path** → **Edit** → **New**:
       - `C:\Program Files\nvm`
       - `C:\Program Files\nodejs`
     - **OK** to close all dialogs. Open a **new** PowerShell.
     - Check:
       ```powershell
       nvm version
       ```
2. Install and use Node 20:
   ```powershell
   nvm install 20.16.0
   nvm use 20.16.0
   node -v    # expect v20.16.0
   npm -v
