# Weight & Balance Calculator

A web-based aircraft weight and balance calculator built for the Curtin Flying Club. Helps pilots verify that their aircraft loading is within safe Center of Gravity (CG) limits before flight.

## Features

- **Weight & balance calculations** for multiple aircraft (Cessna 182T, Cessna 172P)
- **Interactive CG envelope chart** showing takeoff and landing positions relative to limits
- **Aircraft side-view visualization** with weight distribution display
- **Flight planning** with fuel burn rate, duration, and landing weight/CG prediction
- **PDF loading sheet generation** — single-page A4 report with CG chart graphic
- **Unit switching** between lbs/kg, gallons/litres, and inches/mm
- **Real-time validation** of weight limits, CG limits, and combined baggage restrictions

## Tech Stack

- [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for development and builds
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Recharts](https://recharts.org/) for the CG envelope chart
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [React Router](https://reactrouter.com/) for client-side routing
- Deployed on [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

### Installation

```bash
git clone https://github.com/schox/weight-and-balance.git
cd weight-and-balance
npm install
```

### Development

```bash
npm run dev
```

Opens a local development server at `http://localhost:5173` with hot module replacement.

### Build

```bash
npm run build
```

Runs TypeScript type-checking then produces an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── aircraft/        # Aircraft tab selection
│   ├── charts/          # CG envelope chart (Recharts-based)
│   ├── dialogs/         # Modal dialogs (PDF, settings)
│   ├── layout/          # Page layout components
│   ├── settings/        # Settings UI
│   ├── ui/              # Radix UI component wrappers
│   ├── visualizations/  # Side view, visualization tabs
│   └── weight/          # Weight input tiles and summary
├── data/                # Aircraft definitions (stations, envelopes)
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries (cn, theme)
├── pages/               # Route page components
├── types/               # TypeScript type definitions
└── utils/               # Calculations, conversions, PDF generation
```

## Aircraft Data

Aircraft are defined in `src/data/aircraft.ts`. Each aircraft includes:

- Registration, model, and empty weight/CG
- Loading stations with arm positions and weight limits
- CG envelope polygon points (from the aircraft's POH)
- Fuel capacity and default burn rate
- Maximum takeoff, landing, and ramp weights

To add a new aircraft, add a new definition following the existing pattern and register it in the `aircraftDatabase` export.

## How It Works

1. **Loading stations** — Pilot enters weights for each station (passengers, baggage, fuel)
2. **Moment calculation** — Each weight is multiplied by its arm to get the moment
3. **CG position** — Total moment divided by total weight gives the CG position
4. **Envelope check** — The CG position is checked against the aircraft's forward and aft limits at the current weight
5. **Flight planning** — Optional fuel burn data projects the landing weight and CG

## Documentation

Additional documentation is available in the `docs/` directory:

- [User Guide](docs/User-Guide.md) — End-user instructions
- [VH-YPB Calculations Reference](docs/VH-YPB-Calculations-Reference.md) — Worked calculation examples
- [Product Requirements](docs/PRD.md) — Original product requirements

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Disclaimer

This calculator is for **flight planning purposes only**. Always verify weight and balance calculations against your aircraft's official Pilot Operating Handbook (POH) and current weight and balance data. The pilot in command is ultimately responsible for ensuring the aircraft is loaded within limits.
