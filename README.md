# Personal Expense Manager

A web application for tracking personal expenses, built from specific markdown requirements.

## Features
- **Add, Edit, Delete Expenses**: Full CRUD operations.
- **Categorization**: Sort expenses into predefined categories (Food, Transport, Education, Health, Entertainment, Shopping, Other).
- **Filtering**: View expenses by specific category or date range.
- **Budgeting Limits**: Set limits for individual categories and get warnings when limits are exceeded.
- **Persistence**: All data is securely stored in your browser's local storage.
- **Liquid Glass Design**: Premium and modern user interface utilizing glassmorphism aesthetics.

## Technology Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+).
- **Storage**: `localStorage` (No backend required).
- **Hosting**: GitHub Pages.

## Deployment to GitHub Pages
Since the app relies entirely on frontend technologies, it is ready to be hosted natively on GitHub Pages. 
To deploy:
1. Push this code to the `main` branch.
2. The included GitHub Action workflow `.github/workflows/deploy-pages.yml` will automatically build and deploy the root directory to GitHub Pages.

## Development & Usage
- **Running Locally**: Simply open `index.html` in your browser. No build steps or servers are required.
- **Demo Data**: Use the "Reset Demo Data" button in the app header to instantly load sample expenses and limits to explore the features.

## Architecture & Requirements Document
- Requirements can be found in `requirements/Requirements.md`.
- Software Design Record (SDR) can be found in `docs/sdr/SDR.md`.
