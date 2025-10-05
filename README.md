# AniCheck

A modern web application built with SvelteKit, featuring interactive animations powered by PIXI.js and Spine animations.

## Features

- 🎮 Interactive game/animation interface
- 🎨 Spine animation support via PIXI.js
- ⚡ Built with SvelteKit for optimal performance
- 📱 Responsive design
- 🎯 TypeScript support

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```sh
npm install
# or
pnpm install
# or
yarn install
```

### Development

Start the development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run check` - Run type checking
- `npm run format` - Format code with Prettier
- `npm run lint` - Check code formatting

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Project Structure

```
src/
├── lib/
│   ├── game/           # Game components and utilities
│   │   ├── components/ # Reusable game components
│   │   └── utils/      # Game utilities (loaders, etc.)
│   └── assets/         # Static assets
└── routes/             # SvelteKit routes
```

## Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Graphics**: PIXI.js v8
- **Animations**: Spine (via @esotericsoftware/spine-pixi-v8)
- **Build Tool**: Vite
- **Styling**: CSS

## Deployment

To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
