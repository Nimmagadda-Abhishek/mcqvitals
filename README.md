# Assessment Platform Frontend

This is a React-based frontend for the Assessment Platform, built with Vite. It provides interfaces for administrators to create, manage, and evaluate tests, as well as a user-facing assessment interface.

## Features

*   **Assessment Creation**: Create tests with multiple-choice questions, custom options, and detailed explanations.
*   **Media Support**: Add images to questions, options, and explanations to support rich media testing.
*   **Bulk Upload**: Import multiple questions at once using CSV.
*   **Responsive Design**: Modern UI utilizing CSS variables and React Lucide icons.

## Tech Stack

*   [React 19](https://react.dev/)
*   [Vite](https://vitejs.dev/)
*   [React Router](https://reactrouter.com/)
*   [Lucide React](https://lucide.dev/) (Icons)

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm

### Installation

1.  Clone the repository and install dependencies:
    ```bash
    npm install
    ```

2.  Start the development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```

4.  Preview the production build locally:
    ```bash
    npm run preview
    ```

## Project Structure

*   `src/components/`: Reusable React components.
*   `src/pages/`: Main application pages and views (e.g., `AdminTests.jsx`).
*   `src/services/`: API integration layer.

## Development

The project uses `eslint` for linting. You can run the linter using:

```bash
npm run lint
```
