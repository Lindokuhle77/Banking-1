# Khaya Bank: setup and deployment guide

A fictional mobile banking app built with React Native, Expo and TypeScript. It runs on iOS, Android and the web from one codebase.
**Concept only: mocked data, no real banking, money or credentials.** Not affiliated with any bank.

Stage 1: theme, components, navigation. Stage 2: login, PIN, biometrics, auto-lock. Stage 3: accounts, transaction history, search and filters, transaction details. Stage 4: beneficiaries, payments, transfers between accounts, one-time PIN confirmation. Stage 5: card controls, statements, spending insights, notifications. Stage 6 (this version): dark mode, accessibility fixes, automated tests, CI and portfolio docs.

> **Upgrading from Stage 5?** Upload `khaya-bank-stage6.zip` to your Codespace, run `unzip -o khaya-bank-stage6.zip && rm khaya-bank-stage6.zip`, then `git add . && git commit -m "Stage 6: polish and tests" && git push`. Then run `bash scripts/add-tests.sh` once to install the test tools. You do **not** need to run `setup.sh` again. Starting fresh? Follow the steps below, using the stage 3 zip name.

---

## 1. What you need

| Tool | Needed for | Cost | Where |
|---|---|---|---|
| GitHub account | Storing code, Codespaces, Pages, Actions | Free | github.com/signup |
| Web browser | Doing everything below | Free | Chrome, Edge, Safari or Firefox |
| GitHub Codespaces | Cloud dev machine with Node.js, Git and VS Code already installed | Free monthly allowance | Built into GitHub |
| GitHub Pages | Public web demo link | Free for public repos | Built into GitHub |
| GitHub Actions | Builds and deploys the web demo automatically | Free for public repos | Built into GitHub |
| Expo Go app | Running on your phone | Free | App Store / Google Play |

Optional, only if you prefer working on your own computer instead of Codespaces: Node.js 20 LTS (nodejs.org), Git (git-scm.com), Visual Studio Code (code.visualstudio.com).

---

## 2. Create the repository

1. Sign in to GitHub, click **+** (top right), then **New repository**.
2. Name it `khaya-bank`. Choose **Public** (needed for free GitHub Pages).
3. Tick **Add a README file**, then click **Create repository**.

## 3. Open a Codespace and add the project files

1. On your repo page click the green **Code** button, open the **Codespaces** tab, then **Create codespace on main**. Wait for VS Code to load in your browser.
2. Drag `khaya-bank-stage6.zip` from your phone/computer into the **Explorer** panel (left side).
3. Open the terminal (**Terminal > New Terminal**) and run:
   ```
   unzip -o khaya-bank-stage6.zip
   rm khaya-bank-stage6.zip
   bash setup.sh
   ```
   `setup.sh` creates the Expo base project, installs every package and applies the config. It takes a few minutes.

## 4. Run the web version in the Codespace

```
npx expo start --web
```
Open the **Ports** tab (next to Terminal), find port **8081**, and click the globe icon to open the app in a new tab.
Log in with **demo / Khaya@2026**, then create a PIN.

## 5. Run on your phone

1. Install **Expo Go** (no account needed).
2. In the Codespace terminal run:
   ```
   npx expo start --tunnel
   ```
   If asked to install `@expo/ngrok`, answer **Y**.
3. Scan the QR code: iPhone camera app for iOS, the Expo Go app for Android.

Face ID or fingerprint only works if you have set one up on the phone. If not, use the PIN.

## 6. Save your work to GitHub

In the terminal:
```
git add .
git commit -m "Stage 6: polish and tests"
git push
```
(Or use the **Source Control** icon in the left bar: type a message, click **Commit**, then **Sync Changes**.)

## 7. Publish the web demo (GitHub Pages)

1. In your repo go to **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Push to `main` (step 6). The workflow in `.github/workflows/deploy.yml` builds and deploys automatically.
4. Watch progress in the **Actions** tab. When it shows a green tick, your demo is live at:
   `https://YOUR-USERNAME.github.io/khaya-bank/`
5. Add that link and a few screenshots to this README for your portfolio.

## 8. Stop the Codespace

Codespaces use a free monthly allowance. When done: click the **Codespaces** name (bottom-left) > **Stop Current Codespace**. Reopen it any time from github.com/codespaces.

---

## How the security features work (demo level)

- **Login:** checks mock credentials (`demo` / `Khaya@2026`). A real bank checks against a server using OAuth 2.0/OpenID Connect and multi-factor authentication.
- **PIN:** stored on the device (SecureStore on phones, localStorage on web). A real app would hash it and tie it to a device key. Three wrong PINs sign you out.
- **Biometrics:** uses the phone's Face ID or fingerprint through `expo-local-authentication`. Not available on web.
- **Payments:** payments and transfers need a 6-digit one-time PIN, with a limit of R 10,000 each and 3 attempts. In the demo the PIN is shown on screen; a real bank sends it by SMS or app notification, and the server (not the app) checks balances and limits. Balances reset when you refresh, because nothing is saved.
- **Card controls:** freeze, online purchases and international use switches. In a real bank these call the card processor; here they only change the demo state.
- **Appearance:** More > Appearance switches between System, Light and Dark.
- **Auto-lock:** after 2 minutes without touching the screen, or 30 seconds after the app goes to the background.

## Project structure

```
app/            Screens and navigation (Expo Router)
src/auth/       Auth state: login, PIN, lock, timeout
src/components/ Reusable UI: AppText, Button, Card, Field, PinPad, Screen, AccountCard, TransactionRow, BackLink
src/data/       Mock accounts, transactions and beneficiaries (dates are relative to today)
src/bank/       App state for balances, payments and transfers
src/lib/        Formatting helpers and storage
src/theme/      Colours, spacing, type scale
scripts/        configure.js (patches package.json and app.json)
.github/        Workflows: GitHub Pages deploy, and CI (type-check and tests)
__tests__/      Jest tests (formatting, payments logic, PIN pad)
docs/           Screenshots used by the portfolio README
```

## Run the tests

```
npm test
```
The same tests (plus a TypeScript check) run on every push through GitHub Actions: open the **Actions** tab and look at the **CI** workflow.

## Take portfolio screenshots

1. `npm install --save-dev playwright && npx playwright install --with-deps chromium`
2. In one terminal: `npx expo start --web` (wait until it is running on port 8081).
3. In a second terminal: `node scripts/screenshots.js`
4. The images land in `docs/screenshots/` (login, home, account, pay, cards, more, insights). Commit and push them, and the main README shows them. If a screenshot is skipped, take it by hand: open the web app, press F12, choose the phone icon (device toolbar), and use **Capture screenshot**.

## Troubleshooting

- **Blank page on GitHub Pages:** check Settings > Pages source is **GitHub Actions**, and that the workflow in the Actions tab finished green.
- **Port 8081 not showing:** wait for the Metro bundler to print its QR code, then check the Ports tab again.
- **Phone cannot connect:** use `--tunnel`, and make sure the phone has internet access.
- **`npm ci` fails in Actions:** you forgot to commit `package-lock.json`. Run `git add package-lock.json`, commit and push.

## Roadmap

3. (done) Accounts and transactions  4. (done) Payments and beneficiaries  5. (done) Cards, statements, insights  6. (done) Polish, tests, accessibility
