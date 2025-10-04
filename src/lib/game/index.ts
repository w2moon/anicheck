import { Application } from 'pixi.js';

export class Game {
	private app!: Application;

	constructor() {}

	public async init(container: HTMLElement) {
		this.app = new Application();
		await this.app.init({
			background: 0x000000, // 设置背景色为黑色
			width: window.innerWidth,
			height: window.innerHeight
		});
		container.appendChild(this.app.canvas);

		// 监听窗口大小变化
		window.addEventListener('resize', () => {
			this.app.renderer.resize(window.innerWidth, window.innerHeight);
		});
	}
}
