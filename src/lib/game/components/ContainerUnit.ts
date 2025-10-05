import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { ResInstance } from './ResInstance';
import type { ResGroup } from './ResGroup';

export class ContainerUnit {
	private container: Container;
	private resInstances: ResInstance[] = [];
	private background: Graphics;
	private mask: Graphics;
	private idx: number = 0;
	private idxText: Text;

	constructor(options: { idx: number; width: number; height: number }) {
		this.container = new Container();
		this.container.label = 'ContainerUnit';
		this.container.width = options.width;
		this.container.height = options.height;
		this.idx = options.idx;

		// 创建灰色背景
		this.background = new Graphics();
		this.background.rect(0, 0, options.width, options.height);
		this.background.fill(0x808080); // 灰色
		this.background.stroke({ width: 2, color: 0x666666 }); // 深灰色边框
		this.container.addChild(this.background);

		// 创建idx文本
		this.idxText = new Text({
			text: this.idx.toString(),
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 16,
				fill: 0xffffff,
				align: 'left'
			})
		});
		this.idxText.x = 5; // 左上角偏移5像素
		this.idxText.y = 5;
		this.container.addChild(this.idxText);

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

	removeResInstance(resInstance: ResInstance) {
		const index = this.resInstances.indexOf(resInstance);
		if (index > -1) {
			this.resInstances.splice(index, 1);
			this.container.removeChild(resInstance.container);
		}
	}

	removeResGroup(resGroup: ResGroup) {
		// 移除属于指定ResGroup的所有ResInstance
		const instancesToRemove = this.resInstances.filter((instance) => instance.isResGroup(resGroup));
		instancesToRemove.forEach((instance) => this.removeResInstance(instance));
	}

	getResInstances() {
		return [...this.resInstances];
	}

	getContainer() {
		return this.container;
	}

	// 更新容器大小
	updateSize(width: number, height: number) {
		this.container.width = width;
		this.container.height = height;

		// 更新背景大小
		this.background.clear();
		this.background.rect(0, 0, width, height);
		this.background.fill(0x808080);
		this.background.stroke({ width: 2, color: 0x666666 });

		// 更新遮罩大小
		this.mask.clear();
		this.mask.rect(0, 0, width, height);
		this.mask.fill(0xffffff);
	}
}
