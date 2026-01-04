# WearLes (prototype)

This repository contains a small Expo React Native prototype (WearLes) demonstrating:
- Product listing
- Product detail
- Cart with quantity
- Courier selection per order
- Simple checkout flow (mock)
- Local persistence for cart using AsyncStorage

Run locally (recommended)
1. Install Expo & dependencies:
   - npm install -g expo-cli
2. From repository root:
   - npm install
   - npm run start
Ptettier
Notes
- Entry point: `app.js`
- This refactor splits the single-file prototype into `src/screens`, `src/components`, and `src/navigation`.
- For a production app you would add a backend, authentication, and proper form validation.

Formatting
- Run `npm run format` to format code with Prettier.
265310c80377a6ccb6b029731bc1bf5d323eb827
