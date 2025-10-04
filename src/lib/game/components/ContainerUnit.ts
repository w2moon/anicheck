import { Container } from 'pixi.js';

export class ContainerUnit {
	private container: Container;
	constructor(options: { width: number; height: number }) {
		this.container = new Container();
		this.container.width = options.width;
		this.container.height = options.height;
	}

	getContainer() {
		return this.container;
	}
}
