# ⚡ MarineElect

**Multi-vessel ship electrical management for shipyards and marine engineers.**

Live app: **[marineelect.sujikumar.com](https://marineelect.sujikumar.com)**
Simulation module: **[sim.sujikumar.com](https://sim.sujikumar.com)**

---

## The problem

Ship electrical work is tracked across scattered spreadsheets, PDFs, and surveyor emails. Load schedules, switchboard data, fault history, and class-survey deadlines live in different places, so nothing is reconciled against a single vessel of record. I spent years doing this work on live vessels — MarineElect is the tool I wanted then.

## What it does

- **IMO-keyed vessel workspaces** — every vessel is a workspace keyed to its IMO number, so all electrical data stays tied to one ship of record.
- **Switchboard & load analysis** — main switchboard (MSB) structure, load schedules, and distribution data in one view.
- **Fault logging** — record and track electrical faults with history per vessel.
- **Class survey alerts** — surfaces upcoming classification-society survey deadlines so they aren't missed.

### Simulation module (MarineElect Sim)

- IMO-standard **zig-zag** and **turning-circle** maneuvering simulations.
- **Wageningen B-series** propeller curve calculations.
- Ship electrical load analysis.

## Tech stack

- **Next.js** (App Router) + **TypeScript**
- React, Recharts for data visualization
- Deployed on Cloudflare Pages


## Running locally

```bash
git clone https://github.com/sujirex/MarineElect.git
cd MarineElect
npm install
npm run dev
```

Open http://localhost:3000.

## About

Built by **Suji Kumar C** — Digital Maritime Engineer, 13+ years across ship electrical, hull production, nesting, and IT in a working shipyard.
Portfolio: [sujikumar.com](https://sujikumar.com) · LinkedIn: [in/sujirex](https://www.linkedin.com/in/sujirex)
