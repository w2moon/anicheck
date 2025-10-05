import type { Res, ResGroup } from './ResGroup';
import { ResType } from './ResGroup';
import { Container, Sprite, Assets } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

export class ResInstance {
	container: Container;
	private sprite?: Sprite;
	private spine?: Spine;
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

	private async createResource() {
		switch (this.res.type) {
			case ResType.Image:
				this.createImageResource();
				break;
			case ResType.Spine:
				await this.createSpineResource();
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

	private async createSpineResource() {
		const spineData = this.res.data as any; // ResSpine
		if (spineData.skeletonAlias && spineData.atlasAlias) {
			try {
				// 直接使用已加载的Assets别名创建Spine实例
				this.spine = Spine.from({
					skeleton: spineData.skeletonAlias,
					atlas: spineData.atlasAlias
				});

				if (this.spine) {
					// 将Spine作为子元素添加到容器中
					this.container.addChild(this.spine);

					// 设置Spine居中
					this.spine.x = 0;
					this.spine.y = 0;
				} else {
					console.error('Spine.from 返回了 undefined');
				}
			} catch (error) {
				console.error('创建Spine资源失败:', error);
				console.error('skeletonAlias:', spineData.skeletonAlias);
				console.error('atlasAlias:', spineData.atlasAlias);
			}
		} else {
			console.error('缺少必要的Spine数据:', spineData);
		}
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
