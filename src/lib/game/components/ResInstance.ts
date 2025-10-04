import type { Res, ResGroup } from './ResGroup';
import { ResType } from './ResGroup';
import { Container, Sprite } from 'pixi.js';

export class ResInstance {
	container: Container;
	private sprite?: Sprite;
	private isDragging: boolean = false;
	private dragStartX: number = 0;
	private dragStartY: number = 0;
	private initialX: number = 0;
	private initialY: number = 0;

	constructor(
		private res: Res,
		private resGroup: ResGroup
	) {
		this.container = new Container();
		this.createResource();
		this.setupDragEvents();
	}

	private createResource() {
		switch (this.res.type) {
			case ResType.Image:
				this.createImageResource();
				break;
			case ResType.Spine:
				this.createSpineResource();
				break;
			default:
				console.warn('未知的资源类型:', this.res.type);
		}
	}

	private createImageResource() {
		const imageData = this.res.data as any; // ResImage
		if (imageData.texture) {
			this.sprite = new Sprite(imageData.texture);
			this.container.addChild(this.sprite);

			// 设置精灵居中
			this.sprite.anchor.set(0.5, 0.5);
			this.sprite.x = 0;
			this.sprite.y = 0;
		}
	}

	private createSpineResource() {
		// TODO: 实现Spine资源创建
		console.log('Spine资源创建功能待实现');
	}

	private setupDragEvents() {
		// 设置容器为可交互
		this.container.eventMode = 'static';
		this.container.cursor = 'pointer';

		// 鼠标按下事件
		this.container.on('pointerdown', (event) => {
			this.isDragging = true;
			this.dragStartX = event.global.x;
			this.dragStartY = event.global.y;
			this.initialX = this.container.x;
			this.initialY = this.container.y;
		});

		// 鼠标移动事件
		this.container.on('pointermove', (event) => {
			if (this.isDragging) {
				const deltaX = event.global.x - this.dragStartX;
				const deltaY = event.global.y - this.dragStartY;

				const newX = this.initialX + deltaX;
				const newY = this.initialY + deltaY;

				// 调用ResGroup的setPosition方法
				this.resGroup.setPosition(newX, newY);
			}
		});

		// 鼠标释放事件
		this.container.on('pointerup', () => {
			this.isDragging = false;
		});

		// 鼠标离开事件（防止拖拽时鼠标离开元素导致无法释放）
		this.container.on('pointerupoutside', () => {
			this.isDragging = false;
		});
	}

	public isResGroup(resGroup: ResGroup) {
		return this.resGroup === resGroup;
	}
}
