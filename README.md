# EnergyGrid — Smart Energy Monitoring for Goma City

A real-time IoT-based energy monitoring dashboard built to bring intelligence and observability into power distribution in Goma, DRC.

Traditional grids are reactive — they only respond after a failure. This project shifts that paradigm toward a predictive and adaptive system, giving operators full visibility into consumption, voltage stability, and grid health across 100 connected households.

![React](https://img.shields.io/badge/React-18-blue?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-teal?logo=tailwindcss)

🌐 **Live Demo:** [https://energy.wappnet.cc](https://energy.wappnet.cc)

![EnergyGrid Dashboard](./public/Screenshot%202026-04-09%20100242.png)

---

## The Problem

In many growing cities, electricity infrastructure hasn't evolved at the same pace as population and economic activity. In Goma, this leads to:

- Frequent outages with no early warning
- Unstable voltage propagating before detection
- No granular visibility at neighborhood or household level
- Energy providers unable to anticipate demand peaks

This dashboard is the frontend layer of a broader smart grid architecture designed to address these issues.

---

## System Architecture

The full system follows a microservices approach where each layer scales independently.

```
IoT Smart Meters
      │
      ▼ MQTT
Message Broker (RabbitMQ)
      │
      ▼
Backend API (Node.js) ──── Auth, routing, aggregation
      │
      ├──▶ Processing Services (Python) ── Analytics, anomaly detection, ML predictions
      │
      ├──▶ PostgreSQL ── Historical data
      └──▶ Redis ──────── Real-time cache
      │
      ▼
This Dashboard (React)
```

This frontend connects to the backend API and falls back to generated mock data automatically when the backend is unavailable — making it fully usable for demos and development.

---

## Dashboard Features

- System overview with live stats: total power, average voltage, grid efficiency
- Interactive map with house locations, grid lines, and transformer status (Leaflet)
- House list with real-time status (online / warning / offline)
- Per-house detail view with consumption history charts
- Grid page monitoring distribution lines and transformers
- Alerts system with severity levels (low / medium / high / critical) and acknowledgement
- Settings page to configure API endpoint and alert thresholds

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand |
| Data Fetching | TanStack Query + Axios |
| Charts | Recharts |
| Map | Leaflet |

---

## Getting Started

```sh
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

---

## Backend Integration

The app connects to a REST API at `http://localhost:3000/api` by default. If the backend is unreachable, it falls back to mock data automatically — no configuration needed.

The API URL and alert thresholds can be changed from the Settings page inside the app.

Expected endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/houses` | All houses |
| GET | `/api/houses/:id` | Single house |
| GET | `/api/grid-lines` | Grid line data |
| GET | `/api/transformers` | Transformer data |
| GET | `/api/alerts` | Active alerts |
| POST | `/api/alerts/:id/acknowledge` | Acknowledge alert |
| GET | `/api/consumption?hours=24` | Consumption history |
| GET | `/api/stats` | System-wide stats |

---

## Deployment

The project includes a `Dockerfile` using a multi-stage build (Node to compile, nginx to serve).

```sh
docker build -t energygrid .
docker run -p 8080:80 energygrid
```

On Railway: connect your GitHub repo — the Dockerfile is detected automatically. No extra configuration needed.

---

## Project Structure

```
src/
├── components/
│   ├── dashboard/     # StatCard, PowerChart, AlertsList, HouseStatusGrid
│   ├── map/           # EnergyMap (Leaflet)
│   └── ui/            # shadcn/ui components
├── pages/             # Index, Map, Houses, HouseDetails, Grid, Alerts, Settings
├── store/             # Zustand store
├── services/          # API layer with mock fallback
├── data/              # Mock data generators
└── types/             # TypeScript interfaces
```

---

## Related

This dashboard is part of a larger article on building smart grid infrastructure for growing cities.
Read the full write-up: [Building a Smart Grid in Goma](https://your-blog-url.com)

---

## License

MIT
