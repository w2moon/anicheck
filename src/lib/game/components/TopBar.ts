import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Button, Input } from '@pixi/ui';
import { config, saveConfigToStorage } from '../config';
import type { Game } from '../index';
import { ImageLoader } from '../utils/imageLoader';
import { DirectoryLoader } from '../utils/directoryLoader';
import { InfoBar } from './InfoBar';

export class TopBar {
	private container!: Container;
	private columnInput!: Input;
	private widthInput!: Input;
	private heightInput!: Input;
	private app: any;
	private fileInput!: HTMLInputElement;
	private directoryInput!: HTMLInputElement;
	private game: Game;
	private imageLoader: ImageLoader;
	private directoryLoader: DirectoryLoader;
	private infoBar: InfoBar;

	constructor(app: any, game: Game) {
		this.app = app;
		this.game = game;
		this.imageLoader = new ImageLoader(game);
		this.directoryLoader = new DirectoryLoader(game);
		this.infoBar = new InfoBar(game);
	}

	public init() {
		// 创建顶部按钮区域容器
		this.container = new Container();
		this.container.x = 0;
		this.container.y = 0;
		this.app.stage.addChild(this.container);

		// 创建文件输入元素
		this.createFileInput();

		// 创建目录输入元素
		this.createDirectoryInput();

		// 创建按钮区域背景
		this.createBackground();

		// 创建输入框
		this.createInputFields();

		// 添加示例按钮
		this.addSampleButtons();

		// 初始化信息条
		this.infoBar.init();
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
				this.imageLoader.loadAndDisplayImage(file);
			}
			// 清空input的value，确保下次选择同一文件时也能触发change事件
			(event.target as HTMLInputElement).value = '';
		});
	}

	private createDirectoryInput() {
		// 创建隐藏的目录输入元素
		this.directoryInput = document.createElement('input');
		this.directoryInput.type = 'file';
		this.directoryInput.webkitdirectory = true;
		this.directoryInput.multiple = true;
		this.directoryInput.accept = 'image/*';
		this.directoryInput.style.display = 'none';
		document.body.appendChild(this.directoryInput);

		// 监听目录选择事件
		this.directoryInput.addEventListener('change', (event) => {
			const files = (event.target as HTMLInputElement).files;
			if (files && files.length > 0) {
				this.directoryLoader.loadAndDisplayDirectory(files);
			}
			// 清空input的value，确保下次选择同一目录时也能触发change事件
			(event.target as HTMLInputElement).value = '';
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

		// 列数输入框
		const columnLabel = new Text({
			text: '列数',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		columnLabel.x = 0;
		columnLabel.y = 0;
		inputContainer.addChild(columnLabel);

		// 创建列数输入框背景
		const columnInputBg = new Graphics();
		columnInputBg.roundRect(0, 0, 60, 30, 4);
		columnInputBg.fill(0xffffff);
		columnInputBg.stroke({ width: 1, color: 0xcccccc });

		this.columnInput = new Input({
			bg: columnInputBg,
			value: config.rowAmount.toString(),
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x000000,
				align: 'left'
			}),
			padding: { top: 4, right: 4, bottom: 4, left: 4 },
			align: 'left'
		});
		this.columnInput.x = 0;
		this.columnInput.y = 20;
		inputContainer.addChild(this.columnInput);

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
		widthLabel.x = 80;
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
		this.widthInput.x = 80;
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
		heightLabel.x = 160;
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
		this.heightInput.x = 160;
		this.heightInput.y = 20;
		inputContainer.addChild(this.heightInput);

		// 添加输入事件监听
		this.columnInput.onChange.connect((text: string) => {
			console.log('列数输入框值改变:', text);
		});

		this.widthInput.onChange.connect((text: string) => {
			console.log('宽度输入框值改变:', text);
		});

		this.heightInput.onChange.connect((text: string) => {
			console.log('高度输入框值改变:', text);
		});

		this.columnInput.onEnter.connect((text: string) => {
			console.log('列数输入框确认:', text);
			const columns = parseInt(text);
			if (!isNaN(columns) && columns > 0) {
				config.rowAmount = columns;
				saveConfigToStorage();
				this.game.updateColumnsPerRow(columns);
			}
		});

		this.widthInput.onEnter.connect((text: string) => {
			console.log('宽度输入框确认:', text);
			const width = parseInt(text);
			if (!isNaN(width) && width > 0) {
				config.unitWidth = width;
				saveConfigToStorage();
				this.game.updateContainerUnits();
			}
		});

		this.heightInput.onEnter.connect((text: string) => {
			console.log('高度输入框确认:', text);
			const height = parseInt(text);
			if (!isNaN(height) && height > 0) {
				config.unitHeight = height;
				saveConfigToStorage();
				this.game.updateContainerUnits();
			}
		});
	}

	private addSampleButtons() {
		let currentX = 280; // 起始X位置，为新增的列数输入框留出空间
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
			this.directoryInput.click();
		});
		button2.x = currentX;
		button2.y = 20;
		this.container.addChild(button2);
		currentX += button2.width + buttonSpacing;

		// 按钮3
		const button3 = this.createButton('添加spine目录', 0xff9800, () => {
			this.directoryInput.click();
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

	public updateSize() {
		// 更新按钮区域背景大小
		const background = this.container.children[0] as Graphics;
		background.clear();
		background.rect(0, 0, window.innerWidth, 100);
		background.fill(0x333333);

		// 更新信息条大小
		this.infoBar.updateSize();
	}

	public getInfoBar(): InfoBar {
		return this.infoBar;
	}
}
