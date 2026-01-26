# Deployment

Life Binder is a **static, client-side SPA**. There is **no server-side database**: your data lives in the browser (IndexedDB) and is encrypted client-side.

That means deployment is mainly about serving static files (HTML/CSS/JS) behind any web server you like.

## Technology Stack

- **Framework**: React Router v7
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (via `idb`)
- **Encryption**: Web Crypto API (AES-GCM)
- **PDF Generation**: jsPDF

## What you need to know before deploying

- **No backend required.** Hosting is just static files.
- **Backups are on you.** Encourage users to export backups regularly.

---

## Option A: Run with Node

This is the “classic” path: build the SPA with Node, then serve the generated `build/` folder.

```bash
npm install
npm run build
```

---

## Option B: Run with Docker

The provided `Dockerfile` builds the SPA and serves it with **nginx-unprivileged** (listens on **8080** inside the container).

### 1) Docker CLI

Build:

```bash
docker build --platform linux/amd64,linux/arm64 -t lifebinder .
```

Using `--platform` is to enable [multi-platform](https://docs.docker.com/build/building/multi-platform/) support, and being able to run this as a self-hosted tool on Synology.

Run (maps host port **3000** to container port **8080**):

```bash
docker run -d --restart unless-stopped -p 3000:8080 lifebinder
```

Open:

- `http://localhost:3000`

### 2) Docker Compose

The repo includes a `docker-compose.yaml` ready for self-hosting.

Start:

```bash
docker compose up -d
```

Defaults:

- Container listens on `8080`
- Host exposes it on `${EXTERNAL_PORT:-3000}`

Override the external port:

```bash
EXTERNAL_PORT=8080 docker compose up -d
```

Or create a `.env` file next to `docker-compose.yaml`:

```env
EXTERNAL_PORT=3000
BUILD_VERSION=latest
```

### Health check

The container includes a simple health check (HTTP GET `/`). In Docker you’ll see **healthy/unhealthy** status.

---

## Self-hosted notes (Synology Container Manager)

Synology’s Container Manager works well for this kind of “static web app in a box”. The main things to understand are:

1. You have to have Container Manager installed.
2. Go to Registry page inside Container Manager, search for `w0rldart/lifebinder` image, and download it.
3. Run the image, ensuring `Set up web portal via Web Station` option is enabled with 8080 port for HTTP.
4. Go to Web Station when given the option after loading the Docker image, and ensure `Portal type` is configured as `Port-based`. Enable `HTTP` and choose a port you want the app to be accessible on (i.e. 3333)
