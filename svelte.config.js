import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// 设置基础路径为仓库名称（GitHub Pages 需要）
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/anicheck' : ''
		},
		// 使用静态适配器生成纯静态页面
		adapter: adapter({
			// 静态文件输出目录
			pages: 'build',
			assets: 'build',
			// 使用 SPA 模式，生成 index.html 作为回退页面
			fallback: 'index.html'
		}),
		// 禁用服务器端渲染，因为使用了 PIXI.js
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;
