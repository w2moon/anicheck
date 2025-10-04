import { Container, Sprite, Texture } from 'pixi.js';
import { ResInstance } from './ResInstance';

export enum ResType {
	Image,
	Spine
}

export interface ResImage {
	texture: Texture;
}
export interface ResSpine {}
export interface Res {
	type: ResType;

	data: ResImage | ResSpine;
}
export class ResGroup {
	private objs: ResInstance[] = [];
	constructor(private res: Res[]) {}

	createResInstance(idx: number) {
		// 生成对应的ResInstance并返回
		const res = this.res[idx];
		const resInstance = new ResInstance(res);
		this.objs.push(resInstance);
		return resInstance;
	}

	getResCount() {
		return this.res.length;
	}

	setPosition(x: number, y: number) {
		this.objs.forEach((obj) => {
			obj.container.x = x;
			obj.container.y = y;
		});
	}

	setScale(scale: number) {
		this.objs.forEach((obj) => {
			obj.container.scale.set(scale);
		});
	}

	setPivot(x: number, y: number) {
		this.objs.forEach((obj) => {
			obj.container.pivot.set(x, y);
		});
	}
}
