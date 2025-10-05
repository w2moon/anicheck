import { Container, Sprite, Texture } from 'pixi.js';
import { ResInstance } from './ResInstance';
import type { Spine } from '@esotericsoftware/spine-pixi';
import { config } from '../config';

export enum ResType {
	Image,
	Spine
}

export interface ResImage {
	texture: Texture;
}
export interface ResSpine {
	skeletonAlias: string;
	atlasAlias: string;
	animations: string[];
}
export interface Res {
	type: ResType;

	data: ResImage | ResSpine;
}
export class ResGroup {
	private objs: ResInstance[] = [];
	constructor(
		private res: Res[],
		private game?: any
	) {
		this.x = config.unitWidth / 2;
		this.y = config.unitHeight / 2;
	}

	private x: number = 0;
	private y: number = 0;
	private scale: number = 1;
	private pivotX: number = 0;
	private pivotY: number = 0;

	createResInstance(idx: number) {
		// 生成对应的ResInstance并返回
		const res = this.res[idx % this.res.length];
		const resInstance = new ResInstance(res, this, this.game);
		resInstance.container.x = this.x;
		resInstance.container.y = this.y;
		resInstance.container.scale.set(this.scale);
		resInstance.container.pivot.set(this.pivotX, this.pivotY);
		this.objs.push(resInstance);
		return resInstance;
	}

	getResCount() {
		return this.res.length;
	}

	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.objs.forEach((obj) => {
			obj.container.x = x;
			obj.container.y = y;
		});
	}

	setScale(scale: number) {
		this.scale = scale;
		this.objs.forEach((obj) => {
			obj.container.scale.set(scale);
		});
	}

	setPivot(x: number, y: number) {
		this.pivotX = x;
		this.pivotY = y;
		this.objs.forEach((obj) => {
			obj.container.pivot.set(x, y);
		});
	}

	getScale() {
		return this.scale;
	}

	/**
	 * 检查是否包含Spine类型的资源
	 * @returns 是否包含Spine类型
	 */
	public hasSpineType(): boolean {
		return this.res.some((r) => r.type === ResType.Spine);
	}

	/**
	 * 获取Spine动画列表（从第一个Spine资源获取）
	 * @returns 动画名称数组
	 */
	public getSpineAnimations(): string[] {
		const spineRes = this.res.find((r) => r.type === ResType.Spine);
		if (spineRes) {
			const spineData = spineRes.data as ResSpine;
			return spineData.animations || [];
		}
		return [];
	}

	/**
	 * 设置所有Spine实例的动画
	 * @param animationName 动画名称
	 * @param loop 是否循环播放
	 */
	public setSpineAnimation(animationName: string, loop: boolean = true): void {
		this.objs.forEach((obj) => {
			if (obj.isSpineType()) {
				obj.setSpineAnimation(animationName, loop);
			}
		});
	}
}
