import type { Res } from './ResGroup';
import { Container } from 'pixi.js';

export class ResInstance {
	container: Container;
	constructor(private res: Res) {
		this.container = new Container();
	}
}
