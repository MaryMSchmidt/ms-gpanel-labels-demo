# ms-gpanel-labels-demo

A full-stack Gmail **label manager**: a React + Material UI frontend that talks to a Spring Boot API, which calls the Google Gmail API.

```
React (MUI) frontend  ->  Spring Boot REST API  ->  Google Gmail API
```

> **Status:** in progress. The backend connects to Gmail; label endpoints and screens are added on feature branches.

## Project structure

```
ms-gpanel-labels-demo/
├── backend/    Spring Boot 4 · Java 21 · Maven (wrapper included)
└── frontend/   React 19 · TypeScript · Vite
```

## Prerequisites

| Tool  | Version         | Check            |
|-------|-----------------|------------------|
| Java  | 21 or newer     | `java -version`  |
| Node  | 20.19+ or 22.12+ | `node -v`       |
| Git   | any recent      | `git --version`  |

Maven doesn't need to be installed. The backend uses the Maven Wrapper (`./mvnw`), which downloads the correct Maven version on first run.

You also need a Google OAuth client file, `credentials.json` (see [Google setup](#google-setup)).

## Google setup

The backend signs in to Gmail with a Google OAuth **Desktop app** client and only asks for permission to manage labels (`gmail.labels`). Use a test Gmail account, not a personal one: the app creates, edits and deletes labels in it.

Get a `credentials.json` in one of two ways:

- **Provided:** use the file sent to you privately with the submission. Your Gmail address must be added as a test user on that OAuth app.
- **Your own:** in [Google Cloud Console](https://console.cloud.google.com/):
  1. Create a project and enable the **Gmail API**.
  2. Set up the OAuth consent screen: External, Testing, and add your Gmail address as a test user.
  3. Under Credentials, create an **OAuth client ID** of type **Desktop app** and download the JSON file.

Keep the file **outside this repository**.

## Getting started

### Backend

Point the backend at your `credentials.json`, then start it.

macOS / Linux:

```bash
cd backend
export GMAIL_CREDENTIALS_PATH="/full/path/to/credentials.json"
./mvnw spring-boot:run
```

Windows (PowerShell):

```powershell
cd backend
$env:GMAIL_CREDENTIALS_PATH="C:\full\path\to\credentials.json"
.\mvnw.cmd spring-boot:run
```

The variable lasts only for that terminal session, so set it again in a new terminal.

**First run:** a browser opens to Google sign-in.

1. Sign in with your test Gmail account.
2. Google shows "Google hasn't verified this app". This is expected for an app in Testing mode: click **Advanced**, then **Continue**.
3. Click **Allow**. The browser confirms sign-in, and the backend finishes starting.

The sign-in is saved in `backend/tokens/` (never committed), so later runs start without signing in. To sign in again or switch accounts, stop the backend and delete `backend/tokens/`.

The backend runs on <http://localhost:8080>. Sign-in uses port 8888 for a moment, so both ports must be free.

To call the API directly, open `backend/api.http` in VS Code with the REST Client extension and click **Send Request**.

Run the tests (no Google account or credentials needed):

```bash
cd backend
./mvnw test
```

#### Troubleshooting

| Message | Fix |
|---|---|
| `GMAIL_CREDENTIALS_PATH is not set` | Set the variable in this terminal, as shown above. |
| `Cannot read credentials file at ...` | Check the path is complete and the file exists. |
| `Access blocked` or `access_denied` during sign-in | The Gmail account isn't a test user on the OAuth app. |
| `Address already in use` | Port 8080 or 8888 is taken. Stop the other program and try again. |

### Frontend

Start the backend first, then in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. The dev server forwards `/api` requests to the backend on port 8080, so no CORS setup is needed.

## Credentials and security

Google OAuth credentials are **never committed**. The backend reads the `credentials.json` path from the `GMAIL_CREDENTIALS_PATH` environment variable and stops with a clear message if it's missing. `.gitignore` also blocks `credentials*.json`, `client_secret*.json`, OAuth `tokens/` and `.env` files as a safety net.

## Roadmap

### Backend (Spring Boot)

- [x] Gmail API connection (credentials loaded from a local file or environment variable)
- [x] List Gmail labels (`GET /api/labels`)
- [x] Get a label by ID (`GET /api/labels/{id}`)
- [x] Create a label (`POST /api/labels`)
- [x] Update a label (`PATCH /api/labels/{id}`)
- [x] Delete a label (`DELETE /api/labels/{id}`)

### Frontend (React + TypeScript + Vite)

Required libraries: MUI, TanStack Query, React Router (v6/v7), React Hook Form.

- [x] List labels in a DataGrid
- [x] Create a label
- [x] Update a label
- [x] Delete a label
- [x] Navigate to a label detail route when a DataGrid row is clicked (`/labels/:id`)
