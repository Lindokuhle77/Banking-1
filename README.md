# Khaya Bank

A concept mobile banking app built for my portfolio with **React Native, Expo and TypeScript**. One codebase runs on iOS, Android and the web.

> **Concept project.** Fictional bank, mocked data. No real banking, money or credentials, and not affiliated with any bank.

- **Live demo:** `https://Lindokuhle77.github.io/khaya-bank/` &nbsp;|&nbsp; Demo login: `demo` / `Khaya@2026`

![CI](https://github.com/Lindokuhle77/khaya-bank/actions/workflows/ci.yml/badge.svg)


## Screenshots

| Home | Account | Pay |
|---|---|---|
| ![Home](docs/screenshots/home.png) | ![Account](docs/screenshots/account.png) | ![Pay](docs/screenshots/pay.png) |

| Cards | Insights | Login |
|---|---|---|
| ![Cards](docs/screenshots/cards.png) | ![Insights](docs/screenshots/insights.png) | ![Login](docs/screenshots/login.png) |

## What it does

- **Secure sign-in:** login, 4-digit PIN, Face ID or fingerprint, three-strikes sign-out, auto-lock after 2 minutes idle or 30 seconds in the background
- **Accounts:** cheque, savings and credit card with balances, searchable and filterable transaction history grouped by day, transaction details
- **Payments:** add and pay beneficiaries, transfer between own accounts, one-time PIN confirmation, per-payment limit, live balance updates and receipts
- **Cards:** freeze and unfreeze, online and international switches
- **Money tools:** monthly statements (shareable), spending insights by category, in-app notifications
- **Polish:** light and dark mode, screen-reader labels and alerts, large touch targets, automated tests and CI

## Tech

React Native, Expo, Expo Router (file-based navigation), TypeScript, React Context for state, Expo SecureStore and Local Authentication, Jest and Testing Library, GitHub Actions (CI and GitHub Pages deploy).

## How it is built

```
app/            Screens and navigation
src/auth/       Sign-in, PIN, lock and timeout logic
src/bank/       Accounts, payments, cards and notifications state
src/components/ Reusable UI
src/theme/      Design tokens and light/dark themes
__tests__/      Unit and component tests
```

## What a production bank app would do differently

Authentication and OTP delivery on a server (OAuth 2.0 / OpenID Connect, SMS or push), balance and limit checks on the server, hashed and device-bound PINs, certificate pinning, fraud monitoring, audit logging, and compliance work (POPIA and banking regulation). This project shows the front-end architecture and user experience, not those back-end controls.

## Run it yourself

Step-by-step instructions for GitHub Codespaces, your phone and GitHub Pages are in [SETUP.md](SETUP.md).

```
npm test        # run the tests
```
