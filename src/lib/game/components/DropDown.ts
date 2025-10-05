import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Button } from '@pixi/ui';

export interface DropDownOption {
	id: number;
	text: string;
}

export interface DropDownOptions {
	width?: number;
	height?: number;
	backgroundColor?: number;
	hoverColor?: number;
	textColor?: number;
	textStyle?: TextStyle;
	options?: DropDownOption[];
	onSelect?: (option: DropDownOption) => void;
}

export class DropDown extends Container {
	private background!: Graphics;
	private text!: Text;
	private optionsContainer!: Container;
	private options: DropDownOption[] = [];
	private selectedOption: DropDownOption | null = null;
	private isOpen: boolean = false;
	private onSelectCallback?: (option: DropDownOption) => void;
	private button!: Button;

	constructor(private options_: DropDownOptions = {}) {
		super();
		this.onSelectCallback = options_.onSelect;
		this.options = options_.options || [];

		this.init();
	}

	private init() {
		const width = this.options_.width || 120;
		const height = this.options_.height || 25;
		const backgroundColor = this.options_.backgroundColor || 0xffffff;
		const hoverColor = this.options_.hoverColor || 0xf0f0f0;
		const textColor = this.options_.textColor || 0x000000;

		// 创建背景
		this.background = new Graphics();
		this.background.roundRect(0, 0, width, height, 4);
		this.background.fill(backgroundColor);
		this.background.stroke({ width: 1, color: 0xcccccc });
		this.addChild(this.background);

		// 创建文本
		this.text = new Text({
			text: '选择...',
			style:
				this.options_.textStyle ||
				new TextStyle({
					fontFamily: 'Arial',
					fontSize: 12,
					fill: textColor,
					align: 'left'
				})
		});
		this.text.x = 8;
		this.text.y = (height - this.text.height) / 2;
		this.addChild(this.text);

		// 创建下拉箭头
		const arrow = new Graphics();
		arrow.poly([0, 0, 8, 0, 4, 6]);
		arrow.fill(0x666666);
		arrow.x = width - 12;
		arrow.y = (height - 6) / 2;
		this.addChild(arrow);

		// 创建按钮
		this.button = new Button(this.background);
		this.button.onPress.connect(() => {
			this.toggle();
		});

		// 悬停效果
		this.button.onHover.connect(() => {
			this.background.tint = hoverColor;
		});

		this.button.onOut.connect(() => {
			this.background.tint = 0xffffff;
		});

		// 创建选项容器
		this.optionsContainer = new Container();
		this.optionsContainer.visible = false;
		this.addChild(this.optionsContainer);

		// 设置初始选项
		if (this.options.length > 0) {
			this.setSelectedOption(this.options[0]);
		}
	}

	public setOptions(options: DropDownOption[]) {
		this.options = options;
		this.updateOptionsDisplay();

		if (options.length > 0) {
			this.setSelectedOption(options[0]);
		}
	}

	public setSelectedOption(option: DropDownOption) {
		this.selectedOption = option;
		this.text.text = option.text;
		this.close();
	}

	public getSelectedOption(): DropDownOption | null {
		return this.selectedOption;
	}

	public addOption(option: DropDownOption) {
		this.options.push(option);
		this.updateOptionsDisplay();
	}

	public removeOption(id: number) {
		this.options = this.options.filter((opt) => opt.id !== id);
		this.updateOptionsDisplay();
	}

	private updateOptionsDisplay() {
		// 清除现有选项
		this.optionsContainer.removeChildren();

		const width = this.options_.width || 120;
		const backgroundColor = this.options_.backgroundColor || 0xffffff;
		const hoverColor = this.options_.hoverColor || 0xf0f0f0;
		const textColor = this.options_.textColor || 0x000000;
		const optionHeight = 25;

		// 创建选项背景
		const optionsBg = new Graphics();
		optionsBg.roundRect(0, 0, width, this.options.length * optionHeight, 4);
		optionsBg.fill(backgroundColor);
		optionsBg.stroke({ width: 1, color: 0xcccccc });
		this.optionsContainer.addChild(optionsBg);

		// 创建选项按钮
		this.options.forEach((option, index) => {
			const optionButton = new Graphics();
			optionButton.rect(0, index * optionHeight, width, optionHeight);
			optionButton.fill(0x00000000); // 透明背景，用于点击检测

			const optionText = new Text({
				text: option.text,
				style:
					this.options_.textStyle ||
					new TextStyle({
						fontFamily: 'Arial',
						fontSize: 12,
						fill: textColor,
						align: 'left'
					})
			});
			optionText.x = 8;
			optionText.y = index * optionHeight + (optionHeight - optionText.height) / 2;

			const optionContainer = new Container();
			optionContainer.addChild(optionButton);
			optionContainer.addChild(optionText);

			// 悬停效果
			optionContainer.eventMode = 'static';
			optionContainer.cursor = 'pointer';

			optionContainer.on('pointerover', () => {
				optionButton.clear();
				optionButton.rect(0, index * optionHeight, width, optionHeight);
				optionButton.fill(hoverColor);
			});

			optionContainer.on('pointerout', () => {
				optionButton.clear();
				optionButton.rect(0, index * optionHeight, width, optionHeight);
				optionButton.fill(0x00000000);
			});

			optionContainer.on('pointerdown', () => {
				this.setSelectedOption(option);
				if (this.onSelectCallback) {
					this.onSelectCallback(option);
				}
			});

			this.optionsContainer.addChild(optionContainer);
		});

		// 设置选项容器位置
		this.optionsContainer.x = 0;
		this.optionsContainer.y = (this.options_.height || 25) + 2;
	}

	private toggle() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	}

	private open() {
		this.isOpen = true;
		this.optionsContainer.visible = true;
	}

	private close() {
		this.isOpen = false;
		this.optionsContainer.visible = false;
	}

	public destroy() {
		// Button组件不需要手动销毁，它会随着父容器一起销毁
		super.destroy();
	}
}
