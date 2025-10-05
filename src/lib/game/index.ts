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
	private stageY: number = 0; // stage的Y偏移量
	private maxScrollY: number = 0; // 最大滚动距离
	private columnsPerRow: number = config.rowAmount; // 每行列数

	constructor() {}

	// 更新列数
	updateColumnsPerRow(columns: number) {
		this.columnsPerRow = columns;
		this.layoutContainerUnits();
		this.updateScrollBounds();
	}

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
				const unit = new ContainerUnit({
					idx: this.containerUnits.length + 1,
					width: config.unitWidth,
					height: config.unitHeight
				});
				this.containerUnits.push(unit);
				this.app.stage.addChild(unit.getContainer());
			}
		}

		// 按当前的宽高，在屏幕上排列Units，到宽度后自动换行
		this.layoutContainerUnits();

		// 检查所有containerUnits中是否都有对应ResGroup的ResInstance,没有的话则添加
		this.updateResInstances();

		// 更新滚动边界
		this.updateScrollBounds();
	}

	private layoutContainerUnits() {
		const startY = 120; // 避开顶部按钮区域
		const padding = 10; // 单元间距
		const unitsPerRow = this.columnsPerRow; // 使用指定的列数

		// 计算每个单元的实际大小（考虑缩放）
		const availableWidth = window.innerWidth - padding * 2;
		const totalUnitWidth = unitsPerRow * config.unitWidth + (unitsPerRow - 1) * padding;
		const scaleX = totalUnitWidth > availableWidth ? availableWidth / totalUnitWidth : 1;
		const actualUnitWidth = config.unitWidth * scaleX;
		const actualUnitHeight = config.unitHeight * scaleX;

		this.containerUnits.forEach((unit, index) => {
			const row = Math.floor(index / unitsPerRow);
			const col = index % unitsPerRow;

			const x = padding + col * (actualUnitWidth + padding);
			const y = startY + row * (actualUnitHeight + padding);

			unit.getContainer().x = x;
			unit.getContainer().y = y;
			unit.getContainer().scale.set(scaleX);
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

	private updateScrollBounds() {
		if (this.containerUnits.length === 0) {
			this.maxScrollY = 0;
			return;
		}

		// 计算当前缩放比例
		const padding = 10;
		const availableWidth = window.innerWidth - padding * 2;
		const totalUnitWidth =
			this.columnsPerRow * config.unitWidth + (this.columnsPerRow - 1) * padding;
		const scaleX = totalUnitWidth > availableWidth ? availableWidth / totalUnitWidth : 1;
		const actualUnitHeight = config.unitHeight * scaleX;

		// 找到最底部的ContainerUnit
		let maxY = 0;
		this.containerUnits.forEach((unit) => {
			const unitY = unit.getContainer().y + actualUnitHeight;
			if (unitY > maxY) {
				maxY = unitY;
			}
		});

		// 计算最大滚动距离
		// 最大滚动距离 = 最底部unit的底部位置 - 屏幕高度
		this.maxScrollY = Math.max(0, maxY - window.innerHeight);
	}

	private setupScrollEvents() {
		// 监听鼠标滚轮事件
		this.app.canvas.addEventListener('wheel', (event) => {
			event.preventDefault(); // 阻止默认滚动行为

			const scrollSpeed = 50; // 滚动速度
			const deltaY = -event.deltaY;

			// 计算新的Y位置
			let newY = this.stageY + (deltaY * scrollSpeed) / 100;

			// 限制滚动范围
			newY = Math.max(-this.maxScrollY, Math.min(0, newY));

			// 更新stage位置
			this.stageY = newY;
			this.app.stage.y = this.stageY;
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
			this.updateScrollBounds(); // 更新滚动边界
		});

		// 添加鼠标滚轮事件监听
		this.setupScrollEvents();
	}
}
