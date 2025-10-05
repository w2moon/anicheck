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

### GitHub Pages (自动部署)

项目已配置 GitHub Actions 来自动构建和部署到 GitHub Pages。

#### 设置步骤：

1. **启用 GitHub Pages**：
   - 进入仓库的 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **推送代码**：

   ```sh
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **查看部署**：
   - 进入仓库的 Actions 标签页查看构建进度
   - 部署完成后，网站将在 `https://yourusername.github.io/anicheck` 可用

#### 工作流说明：

- **自动触发**：每次推送到 `main` 分支时自动部署
- **构建过程**：安装依赖 → 构建项目 → 部署到 GitHub Pages
- **分支保护**：Pull Request 会进行构建测试但不部署

#### 本地预览构建结果：

```sh
npm run build
npm run preview
```

### 其他部署选项

如需部署到其他平台，可以参考 [SvelteKit 适配器文档](https://svelte.dev/docs/kit/adapters)。
