# PDD Feature Spec: Loki System Log Viewer

## 1. Feature Description
Provide a sleek, developer-centric terminal panel that displays live system-wide backend microservices logs streamed directly from Grafana Loki, complete with level highlights and auto-refresh mechanisms.

---

## 2. Technical Contracts & Mappings

### Backend REST Contract
* **Loki query:** `GET /loki/loki/api/v1/query_range` (Vite Proxy mapped to Loki container port `3100`)
* **Request Params:**
  ```json
  {
    "query": "{service_name=~\".+\"}",
    "limit": 100,
    "direction": "backward"
  }
  ```

---

## 3. Frontend UI Specifications

### Log Terminal Panel (`src/pages/LogViewer.jsx`)
* **Visuals:** High-contrast retro terminal style box with a dark slate background, neon borders, and monospace font families.
* **Metadata tags:**
  * **Timestamp:** `[YYYY-MM-DD HH:MM:SS]` formatted in slate gray.
  * **Service tag:** Dynamically color-coded based on service name (e.g. `USER` in bright indigo, `PROJECT` in emerald, `TESTCASE` in blue).
  * **Severity tag:** Highlights `INFO` in solid blue and `ERROR` in bold red.
* **Interactivity:**
  * **Auto-refresh checkbox:** Activating automatically schedules the logs to poll Loki every 5000ms.
  * **Manual Refresh button:** Renders a rotating Lucide circular icon that fetches logs immediately on click.
