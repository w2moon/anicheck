import { Container, Graphics } from 'pixi.js';
import { ResInstance } from './ResInstance';
import type { ResGroup } from './ResGroup';

export class ContainerUnit {
	private container: Container;
	private resInstances: ResInstance[] = [];
	private background: Graphics;
	private mask: Graphics;

	constructor(options: { width: number; height: number }) {
		this.container = new Container();
		this.container.label = 'ContainerUnit';
		this.container.width = options.width;
		this.container.height = options.height;

		// 创建灰色背景
		this.background = new Graphics();
		this.background.rect(0, 0, options.width, options.height);
		this.background.fill(0x808080); // 灰色
		this.background.stroke({ width: 2, color: 0x666666 }); // 深灰色边框
		this.container.addChild(this.background);

		// 创建遮罩
		this.mask = new Graphics();
		this.mask.rect(0, 0, options.width, options.height);
		this.mask.fill(0xffffff); // 白色填充，用于遮罩
		this.container.addChild(this.mask); // 将遮罩添加到容器中
		this.container.mask = this.mask;
	}

	hasResGroup(resGroup: ResGroup) {
		return this.resInstances.some((resInstance) => resInstance.isResGroup(resGroup));
	}

	addResInstance(resInstance: ResInstance) {
		this.resInstances.push(resInstance);
		this.container.addChild(resInstance.container);
	}

	getContainer() {
		return this.container;
	}
}
