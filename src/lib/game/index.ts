import { Application } from 'pixi.js';
import { TopBar } from './components/TopBar';

export class Game {
	private app!: Application;
	private topBar!: TopBar;

	constructor() {}

	public async init(container: HTMLElement) {
		this.app = new Application();
		await this.app.init({
			background: 0x000000, // 设置背景色为黑色
			width: window.innerWidth,
			height: window.innerHeight
		});
		container.appendChild(this.app.canvas);

		// 创建顶部按钮栏
		this.topBar = new TopBar(this.app);
		this.topBar.init();

		// 监听窗口大小变化
		window.addEventListener('resize', () => {
			this.app.renderer.resize(window.innerWidth, window.innerHeight);
			this.topBar.updateSize();
		});
	}
}
