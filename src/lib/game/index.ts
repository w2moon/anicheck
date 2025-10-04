import { Application } from 'pixi.js';
import { TopBar } from './components/TopBar';
import { ContainerUnit } from './components/ContainerUnit';
import { ResGroup } from './components/ResGroup';
import { config } from './config';

export class Game {
	private app!: Application;
	private topBar!: TopBar;
	private containerUnits: ContainerUnit[] = [];
	private resGroups: ResGroup[] = [];

	constructor() {}

	addResGroup(group: ResGroup) {
		this.resGroups.push(group);
		this.updateContainerUnits();
	}

	updateContainerUnits() {
		// 获取resGroups中最长的值
		const maxLength = Math.max(...this.resGroups.map((group) => group.getResCount()));
		const needUnits = maxLength - this.containerUnits.length;
		if (needUnits > 0) {
			for (let i = 0; i < needUnits; i++) {
				const unit = new ContainerUnit({ width: config.unitWidth, height: config.unitHeight });
				this.containerUnits.push(unit);
				this.app.stage.addChild(unit.getContainer());
			}
		}

		// 按当前的宽高，在屏幕上排列Units，到宽度后自动换行
		this.layoutContainerUnits();

		// 检查所有containerUnits中是否都有对应ResGroup的ResInstance,没有的话则添加
		this.updateResInstances();
	}

	private layoutContainerUnits() {
		const startY = 120; // 避开顶部按钮区域
		const padding = 10; // 单元间距
		const unitsPerRow = Math.floor((window.innerWidth - padding) / (config.unitWidth + padding));

		this.containerUnits.forEach((unit, index) => {
			const row = Math.floor(index / unitsPerRow);
			const col = index % unitsPerRow;

			const x = padding + col * (config.unitWidth + padding);
			const y = startY + row * (config.unitHeight + padding);

			unit.getContainer().x = x;
			unit.getContainer().y = y;
		});
	}

	private updateResInstances() {
		// 为每个ContainerUnit检查并添加对应的ResInstance
		this.containerUnits.forEach((unit, index) => {
			this.resGroups.forEach((group) => {
				if (!unit.hasResGroup(group)) {
					unit.addResInstance(group.createResInstance(index));
				}
			});
		});
	}

	public async init(container: HTMLElement) {
		this.app = new Application();
		(globalThis as any).__PIXI_APP__ = this.app;
		await this.app.init({
			background: 0x000000, // 设置背景色为黑色
			width: window.innerWidth,
			height: window.innerHeight,
			resolution: window.devicePixelRatio || 1, // 启用高DPI渲染
			autoDensity: true // 自动调整密度
		});
		container.appendChild(this.app.canvas);

		// 创建顶部按钮栏
		this.topBar = new TopBar(this.app, this);
		this.topBar.init();

		// 监听窗口大小变化
		window.addEventListener('resize', () => {
			this.app.renderer.resize(window.innerWidth, window.innerHeight);
			this.topBar.updateSize();
			this.layoutContainerUnits(); // 重新布局ContainerUnit
		});
	}
}
