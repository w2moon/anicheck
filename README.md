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
- Bun (推荐) 或 npm/yarn

### Installation

1. Clone the repository
2. Install dependencies:

```sh
bun install
# or
npm install
```

### Development

Start the development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run check` - Run type checking
- `bun run format` - Format code with Prettier
- `bun run lint` - Check code formatting

## Building

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with `bun run preview`.

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
