import type { Res, ResGroup } from './ResGroup';
import { ResType } from './ResGroup';
import { Container, Sprite } from 'pixi.js';

export class ResInstance {
	container: Container;
	private sprite?: Sprite;

	constructor(
		private res: Res,
		private resGroup: ResGroup
	) {
		this.container = new Container();
		this.createResource();
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

	public isResGroup(resGroup: ResGroup) {
		return this.resGroup === resGroup;
	}
}
