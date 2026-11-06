# ms-gpanel-labels-demo

A full-stack Gmail **label manager**: a React + Material UI frontend that talks to a Spring Boot API, which calls the Google Gmail API.

```
React (MUI) frontend  ->  Spring Boot REST API  ->  Google Gmail API
```

> **Status:** project skeleton only. Features will be added on feature branches.

## Project structure

```
ms-gpanel-labels-demo/
├── backend/    Spring Boot 4 · Java 21 · Maven (wrapper included)
└── frontend/   React 19 · TypeScript · Vite
```

## Prerequisites

| Tool  | Version         | Check            |
|-------|-----------------|------------------|
| Java  | 21              | `java -version`  |
| Node  | 22 LTS (20.19+) | `node -v`        |
| Git   | any recent      | `git --version`  |

Maven doesn't need to be installed. The backend uses the Maven Wrapper (`./mvnw`), which downloads the correct Maven version on first run.

## Getting started

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Runs on <http://localhost:8080>.

Run the tests:

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on <http://localhost:5173>.

## Credentials and security

Google OAuth credentials are **never committed**. The `credentials.json` file is kept outside the repository, and `.gitignore` blocks `credentials*.json`, `client_secret*.json`, OAuth `tokens/` and `.env` files as a safety net.

_How the backend loads credentials will be documented here once the Gmail integration is added._

## Roadmap

### Backend (Spring Boot)

- [ ] Gmail API connection (credentials loaded from a local file or environment variable)
- [ ] List Gmail labels
- [ ] Get a label by ID
- [ ] Create a label
- [ ] Update a label
- [ ] Delete a label

### Frontend (React + TypeScript + Vite)

Required libraries: MUI, TanStack Query, React Router (v6/v7), React Hook Form.

- [ ] List labels in a DataGrid
- [ ] Create a label
- [ ] Update a label
- [ ] Delete a label
- [ ] Navigate to a label detail route when a DataGrid row is clicked
