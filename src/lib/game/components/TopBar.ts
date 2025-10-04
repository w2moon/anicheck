import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Button, Input } from '@pixi/ui';

export class TopBar {
	private container!: Container;
	private widthInput!: Input;
	private heightInput!: Input;
	private app: any;

	constructor(app: any) {
		this.app = app;
	}

	public init() {
		// 创建顶部按钮区域容器
		this.container = new Container();
		this.container.x = 0;
		this.container.y = 0;
		this.app.stage.addChild(this.container);

		// 创建按钮区域背景
		this.createBackground();

		// 创建输入框
		this.createInputFields();

		// 添加示例按钮
		this.addSampleButtons();
	}

	private createBackground() {
		const background = new Graphics();
		background.rect(0, 0, window.innerWidth, 100);
		background.fill(0x333333);
		this.container.addChild(background);
	}

	private createInputFields() {
		// 创建输入框容器
		const inputContainer = new Container();
		inputContainer.x = 10;
		inputContainer.y = 10;
		this.container.addChild(inputContainer);

		// 宽度输入框
		const widthLabel = new Text({
			text: '宽',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		widthLabel.x = 0;
		widthLabel.y = 0;
		inputContainer.addChild(widthLabel);

		// 创建宽度输入框背景
		const widthInputBg = new Graphics();
		widthInputBg.roundRect(0, 0, 60, 30, 4);
		widthInputBg.fill(0xffffff);
		widthInputBg.stroke({ width: 1, color: 0xcccccc });

		this.widthInput = new Input({
			bg: widthInputBg,
			value: '100',
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x000000,
				align: 'left'
			}),
			padding: { top: 4, right: 4, bottom: 4, left: 4 },
			align: 'left'
		});
		this.widthInput.x = 0;
		this.widthInput.y = 20;
		inputContainer.addChild(this.widthInput);

		// 高度输入框
		const heightLabel = new Text({
			text: '高',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		heightLabel.x = 80;
		heightLabel.y = 0;
		inputContainer.addChild(heightLabel);

		// 创建高度输入框背景
		const heightInputBg = new Graphics();
		heightInputBg.roundRect(0, 0, 60, 30, 4);
		heightInputBg.fill(0xffffff);
		heightInputBg.stroke({ width: 1, color: 0xcccccc });

		this.heightInput = new Input({
			bg: heightInputBg,
			value: '100',
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x000000,
				align: 'left'
			}),
			padding: { top: 4, right: 4, bottom: 4, left: 4 },
			align: 'left'
		});
		this.heightInput.x = 80;
		this.heightInput.y = 20;
		inputContainer.addChild(this.heightInput);

		// 添加输入事件监听
		this.widthInput.onChange.connect((text: string) => {
			console.log('宽度输入框值改变:', text);
		});

		this.heightInput.onChange.connect((text: string) => {
			console.log('高度输入框值改变:', text);
		});

		this.widthInput.onEnter.connect((text: string) => {
			console.log('宽度输入框确认:', text);
		});

		this.heightInput.onEnter.connect((text: string) => {
			console.log('高度输入框确认:', text);
		});
	}

	private addSampleButtons() {
		// 按钮1
		const button1 = this.createButton('按钮1', 0x4caf50);
		button1.x = 200;
		button1.y = 20;
		this.container.addChild(button1);

		// 按钮2
		const button2 = this.createButton('按钮2', 0x2196f3);
		button2.x = 330;
		button2.y = 20;
		this.container.addChild(button2);

		// 按钮3
		const button3 = this.createButton('按钮3', 0xff9800);
		button3.x = 460;
		button3.y = 20;
		this.container.addChild(button3);
	}

	private createButton(text: string, color: number) {
		// 创建按钮背景
		const background = new Graphics();
		background.roundRect(0, 0, 100, 60, 8); // 添加圆角
		background.fill(color);
		background.stroke({ width: 2, color: 0xffffff });

		// 创建按钮文字
		const buttonText = new Text({
			text: text,
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 16,
				fill: 0xffffff,
				align: 'center'
			})
		});
		buttonText.anchor.set(0.5);
		buttonText.x = 50;
		buttonText.y = 30;

		// 创建按钮容器
		const buttonContainer = new Container();
		buttonContainer.addChild(background);
		buttonContainer.addChild(buttonText);
		buttonContainer.cursor = 'pointer';

		// 使用PixiUI Button组件
		const button = new Button(buttonContainer);

		// 添加事件监听
		button.onPress.connect(() => {
			console.log(`点击了${text}`);
		});

		button.onHover.connect(() => {
			background.tint = 0xcccccc;
		});

		button.onOut.connect(() => {
			background.tint = 0xffffff;
		});

		button.onDown.connect(() => {
			background.tint = 0xaaaaaa;
		});

		button.onUp.connect(() => {
			background.tint = 0xffffff;
		});

		return button.view;
	}

	public updateSize() {
		// 更新按钮区域背景大小
		const background = this.container.children[0] as Graphics;
		background.clear();
		background.rect(0, 0, window.innerWidth, 100);
		background.fill(0x333333);
	}
}
