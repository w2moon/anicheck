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
}
export interface Res {
	type: ResType;

	data: ResImage | ResSpine;
}
export class ResGroup {
	private objs: ResInstance[] = [];
	constructor(private res: Res[]) {
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
		const resInstance = new ResInstance(res, this);
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
}
