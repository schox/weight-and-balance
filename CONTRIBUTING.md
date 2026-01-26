# Contributing

Thanks for your interest in contributing to the Weight & Balance Calculator.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/weight-and-balance.git`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b my-feature`
5. Start the dev server: `npm run dev`

## Development Workflow

1. Make your changes
2. Ensure the build passes: `npm run build`
3. Run the linter: `npm run lint`
4. Commit your changes with a clear message
5. Push to your fork and open a Pull Request

## Adding a New Aircraft

To add support for a new aircraft:

1. Open `src/data/aircraft.ts`
2. Define the loading stations array with arm positions (in mm) and weight limits (in lbs)
3. Define the CG envelope points from the aircraft's POH (weight in lbs, CG in mm)
4. Create the aircraft definition with empty weight, CG, max weights, and fuel capacity
5. Add the aircraft to the `aircraftDatabase` export

Use the existing VH-YPB (Cessna 182T) and VH-KXW (Cessna 172S) definitions as reference.

## Code Style

- TypeScript strict mode is enabled
- Follow the existing patterns for component structure
- Use Tailwind CSS for styling (no inline styles or CSS modules)
- Keep components focused — one responsibility per component
- Use the existing UI primitives in `src/components/ui/` rather than creating new ones

## Pull Request Guidelines

- Keep PRs focused on a single change
- Include a description of what the change does and why
- Ensure `npm run build` and `npm run lint` pass
- Test with both aircraft (VH-YPB and VH-KXW) if your change affects calculations or display

## Reporting Issues

When reporting bugs, please include:

- Steps to reproduce
- Expected behaviour
- Actual behaviour
- Browser and OS information
- Screenshots if applicable

## Aviation Data Accuracy

If you're modifying aircraft data (weights, arms, CG envelope points), please reference the source POH section or weight and balance report. Accuracy is critical for aviation safety tools.
