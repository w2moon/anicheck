import { Container, Graphics, Text, TextStyle, Sprite, Texture } from 'pixi.js';
import { Button, Input } from '@pixi/ui';
import { config } from '../config';

export class TopBar {
	private container!: Container;
	private widthInput!: Input;
	private heightInput!: Input;
	private app: any;
	private fileInput!: HTMLInputElement;

	constructor(app: any) {
		this.app = app;
	}

	public init() {
		// 创建顶部按钮区域容器
		this.container = new Container();
		this.container.x = 0;
		this.container.y = 0;
		this.app.stage.addChild(this.container);

		// 创建文件输入元素
		this.createFileInput();

		// 创建按钮区域背景
		this.createBackground();

		// 创建输入框
		this.createInputFields();

		// 添加示例按钮
		this.addSampleButtons();
	}

	private createFileInput() {
		// 创建隐藏的文件输入元素
		this.fileInput = document.createElement('input');
		this.fileInput.type = 'file';
		this.fileInput.accept = 'image/*';
		this.fileInput.style.display = 'none';
		document.body.appendChild(this.fileInput);

		// 监听文件选择事件
		this.fileInput.addEventListener('change', (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				this.loadAndDisplayImage(file);
			}
		});
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
			value: config.unitWidth.toString(),
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
			value: config.unitHeight.toString(),
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
		let currentX = 200; // 起始X位置
		const buttonSpacing = 20; // 按钮间距

		// 按钮1 - 添加图片
		const button1 = this.createButton('添加图片', 0x4caf50, () => {
			this.fileInput.click();
		});
		button1.x = currentX;
		button1.y = 20;
		this.container.addChild(button1);
		currentX += button1.width + buttonSpacing;

		// 按钮2
		const button2 = this.createButton('添加图片目录', 0x2196f3, () => {
			console.log('点击了添加图片目录');
		});
		button2.x = currentX;
		button2.y = 20;
		this.container.addChild(button2);
		currentX += button2.width + buttonSpacing;

		// 按钮3
		const button3 = this.createButton('添加spine目录', 0xff9800, () => {
			console.log('点击了添加spine目录');
		});
		button3.x = currentX;
		button3.y = 20;
		this.container.addChild(button3);
	}

	private createButton(text: string, color: number, onClick?: () => void) {
		// 创建按钮文字来测量宽度
		const tempText = new Text({
			text: text,
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 16,
				fill: 0xffffff,
				align: 'center'
			})
		});

		// 计算按钮宽度，基于文字宽度加上内边距
		const textWidth = tempText.width;
		const buttonWidth = Math.max(100, textWidth + 32); // 最小宽度100，左右各16px内边距
		const buttonHeight = 60;

		// 创建按钮背景
		const background = new Graphics();
		background.roundRect(0, 0, buttonWidth, buttonHeight, 8); // 添加圆角
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
		buttonText.x = buttonWidth / 2;
		buttonText.y = buttonHeight / 2;

		// 创建按钮容器
		const buttonContainer = new Container();
		buttonContainer.addChild(background);
		buttonContainer.addChild(buttonText);
		buttonContainer.cursor = 'pointer';

		// 使用PixiUI Button组件
		const button = new Button(buttonContainer);

		// 添加事件监听
		button.onPress.connect(() => {
			if (onClick) {
				onClick();
			} else {
				console.log(`点击了${text}`);
			}
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

	private loadAndDisplayImage(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			const imageUrl = e.target?.result as string;
			if (imageUrl) {
				// 创建图片元素
				const img = new Image();
				img.onload = () => {
					// 从图片元素创建纹理
					const texture = Texture.from(img);

					// 创建精灵
					const sprite = new Sprite(texture);

					// 设置位置（在canvas中央，但避开顶部按钮区域）
					sprite.x = (window.innerWidth - sprite.width) / 2;
					sprite.y = Math.max(120, (window.innerHeight - sprite.height) / 2);

					// 如果图片太大，按比例缩放
					const maxWidth = window.innerWidth * 0.8;
					const maxHeight = (window.innerHeight - 120) * 0.8;

					if (sprite.width > maxWidth || sprite.height > maxHeight) {
						const scaleX = maxWidth / sprite.width;
						const scaleY = maxHeight / sprite.height;
						const scale = Math.min(scaleX, scaleY);
						sprite.scale.set(scale);

						// 重新计算位置
						sprite.x = (window.innerWidth - sprite.width) / 2;
						sprite.y = Math.max(120, (window.innerHeight - sprite.height) / 2);
					}

					// 添加到舞台
					this.app.stage.addChild(sprite);

					console.log('图片已加载并显示到canvas上');
				};
				img.src = imageUrl;
			}
		};
		reader.readAsDataURL(file);
	}

	public updateSize() {
		// 更新按钮区域背景大小
		const background = this.container.children[0] as Graphics;
		background.clear();
		background.rect(0, 0, window.innerWidth, 100);
		background.fill(0x333333);
	}
}
