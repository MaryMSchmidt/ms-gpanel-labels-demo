# ms-gpanel-labels-demo

A full-stack Gmail **label manager**: a React + Material UI frontend that talks to a Spring Boot API, which calls the Google Gmail API.

```
React (MUI) frontend  ->  Spring Boot REST API  ->  Google Gmail API
```

**What it does**

- Lists the Gmail account's labels in a DataGrid. Clicking a row opens that label's detail page (`/labels/:id`).
- Creates, renames and deletes user labels. System labels such as INBOX and SENT are read-only, as they are in Gmail.

## Project structure

```
ms-gpanel-labels-demo/
├── .github/workflows/ci.yml   Tests, coverage, lint and build on every pull request
├── backend/                   Spring Boot 4 · Java 21 · Maven (wrapper included)
│   ├── api.http               Ready-made requests for every endpoint
│   └── src/main/java/com/maryschmidt/gpanel/labels/
│       ├── config/            Gmail client and Google sign-in
│       ├── label/             Controller, service, request and response records
│       └── error/             Turns Gmail and validation errors into JSON responses
└── frontend/                  React 19 · TypeScript · Vite · MUI
    └── src/
        ├── api/               fetch calls and the ApiError type
        ├── hooks/             TanStack Query queries and mutations
        ├── components/        Create, edit and delete dialogs
        └── pages/             Labels grid, label detail, page not found
```

## Prerequisites

| Tool  | Version         | Check            |
|-------|-----------------|------------------|
| Java  | 21 or newer     | `java -version`  |
| Node  | 22.22 or newer  | `node -v`        |
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

## API

All endpoints are under `/api/labels`. `POST` and `PATCH` take a JSON body: `{ "name": "Receipts" }`.

| Method | Path | Success | Errors |
|---|---|---|---|
| `GET` | `/api/labels` | 200 with every label | |
| `GET` | `/api/labels/{id}` | 200 with the label | 404 unknown id |
| `POST` | `/api/labels` | 201 with the new label and a `Location` header | 400 blank or invalid name, 409 name already exists |
| `PATCH` | `/api/labels/{id}` | 200 with the renamed label | 400 blank name or system label, 404 unknown id, 409 name already exists |
| `DELETE` | `/api/labels/{id}` | 204, no body | 400 system label, 404 unknown id |

Every error is a JSON [Problem Detail](https://www.rfc-editor.org/rfc/rfc9457) with a readable `detail` message. Any endpoint can also return 429 when Gmail is rate limiting, or 502 when Gmail fails or can't be reached.

## Tests

The tests replace Gmail with a mock, so they need no Google account or credentials.

**Backend** (JUnit, Mockito, MockMvc):

```bash
cd backend
./mvnw verify
```

This runs the tests and measures line coverage with JaCoCo. The build fails below 75%. The report is at `backend/target/site/jacoco/index.html`. The Google sign-in in `GmailConfig` and the `main` method aren't covered, because they open a real browser; they're checked by hand every time the backend starts.

**Frontend** (Vitest, React Testing Library):

```bash
cd frontend
npm test
npm run coverage
```

`npm test` runs the tests once. `npm run coverage` also measures coverage and fails below 75%; the report is at `frontend/coverage/index.html`. The page tests run the real components, hooks and API client against a small in-memory fake backend.

**CI:** every pull request and every push to main runs both on GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): `./mvnw verify` for the backend, and lint, tests with coverage, and the build for the frontend.

## Design decisions

- **Local and single user.** The app signs in one Gmail account on the machine it runs on. Gmail is the only data store, so there's no database.
- **Desktop OAuth with only the `gmail.labels` scope.** It's the simplest secure sign-in for a local app. The app can manage labels but can't read, send or delete mail (least privilege).
- **Sign-in at startup.** If the credentials are missing or sign-in fails, the backend stops with a clear message instead of starting and failing on the first request. The trade-off is that the first start waits for sign-in.
- **Thin layers.** The controller handles HTTP, the service talks to Gmail, and one `@RestControllerAdvice` turns errors into responses. The `LabelRequest` and `LabelResponse` records keep Google's model out of the API.
- **PATCH for rename.** Only the name changes, so only the name is sent. The label's visibility settings stay as they are.
- **Errors that mean something.** Gmail's 404 and 409 keep their status with a clearer message. Gmail's 400 is passed through with its own message, such as "Cannot update system label names". 429 stays 429 so a client knows to wait. Anything else becomes 502, because the problem is between the server and Gmail, not in the request.
- **System labels are read-only.** The UI disables Edit and Delete for them, and the API returns Gmail's 400 if a request gets through anyway.
- **Validation in both places.** The form blocks blank names for instant feedback. The API checks again, because it can't trust its callers.
- **Predictable data on screen.** TanStack Query caches the list (`['labels']`) and each label (`['labels', id]`). Every change refreshes the list, so all screens stay in sync. 4xx errors aren't retried, because they won't fix themselves; server and network errors retry up to three times.
- **One form for create and edit.** `LabelFormDialog` holds the form and its validation. `CreateLabelDialog` and `EditLabelDialog` only supply the title, the starting name and what Save does.
- **A Vite proxy instead of CORS.** In development the browser only talks to `localhost:5173`, which forwards `/api` to the backend, so the backend needs no CORS setup.

## Production at gPanel

This is a local demo. For gPanel's Google Workspace customers I would change:

- **Access:** a service account with domain-wide delegation, so the app can manage labels for users in a customer's Workspace domain without each user signing in.
- **Secrets:** no key files on disk. Use Workload Identity where possible, and Secret Manager for anything that must be a secret.
- **Hosting:** the backend on Cloud Run, with the built frontend served from the same origin, so still no CORS.
- **Users:** sign-in for our own API, and if users connect their own accounts, the web OAuth flow with each user's tokens stored encrypted.
- **Operations:** structured logs and metrics for Gmail errors and latency, and retries with backoff for 429 and 5xx responses.

## Next steps

- Retry with backoff when Gmail returns 429.
- Keyboard access to the detail page (today a row opens on click).
- An end-to-end test with Playwright against a test Gmail account.

## Credentials and security

Google OAuth credentials are **never committed**. The backend reads the `credentials.json` path from the `GMAIL_CREDENTIALS_PATH` environment variable and stops with a clear message if it's missing. `.gitignore` also blocks `credentials*.json`, `client_secret*.json`, OAuth `tokens/` and `.env` files as a safety net.
