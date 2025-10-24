import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Button, Input } from '@pixi/ui';
import type { ResGroup } from './ResGroup';
import { ResType } from './ResGroup';
import type { Game } from '../index';
import { DropDown, type DropDownOption } from './DropDown';

export class InfoBar {
	private container!: Container;
	private scaleInput!: Input;
	private deleteButton!: Button;
	private animationSelect?: DropDown;
	private animationLabel?: Text;
	private alignmentSelect?: DropDown;
	private alignmentLabel?: Text;
	private loopCheckbox?: Button;
	private loopCheckboxLabel?: Text;
	private loopCheckboxContainer?: Container;
	private relativeCheckbox?: Button;
	private relativeCheckboxLabel?: Text;
	private relativeCheckboxContainer?: Container;
	private playButton?: Button;
	private playButtonLabel?: Text;
	private selectedResGroup: ResGroup | null = null;
	private selectedResInstance: any = null; // 添加选中的ResInstance引用
	private relativeXInput?: Input;
	private relativeYInput?: Input;
	private positionXInput?: Input;
	private positionYInput?: Input;
	private exportButton?: Button;
	private game: Game;
	private isDragging: boolean = false; // 添加拖动状态标志
	private isUserInput: boolean = false; // 添加用户输入标志

	constructor(game: Game) {
		this.game = game;
	}

	public init() {
		// 创建信息条容器
		this.container = new Container();
		this.container.x = 0;
		this.container.y = 100; // TopBar下方
		this.game.getApp().stage.addChild(this.container);

		// 创建背景
		this.createBackground();

		// 创建分隔线
		this.createSeparator();

		// 创建信息条内容
		this.createContent();

		// 初始状态隐藏信息条
		this.hide();
	}

	private createBackground() {
		const background = new Graphics();
		background.rect(0, 0, window.innerWidth, 80);
		background.fill(0x2a2a2a);
		this.container.addChild(background);
	}

	private createSeparator() {
		const separator = new Graphics();
		separator.rect(0, 0, window.innerWidth, 1);
		separator.fill(0x666666);
		this.container.addChild(separator);
	}

	private createContent() {
		const contentContainer = new Container();
		contentContainer.x = 20;
		contentContainer.y = 15;
		this.container.addChild(contentContainer);

		// 对象组信息标签
		const infoLabel = new Text({
			text: '对象组信息',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 16,
				fill: 0xffffff,
				align: 'left'
			})
		});
		infoLabel.x = 0;
		infoLabel.y = 0;
		contentContainer.addChild(infoLabel);

		// 缩放标签
		const scaleLabel = new Text({
			text: '缩放:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		scaleLabel.x = 0;
		scaleLabel.y = 25;
		contentContainer.addChild(scaleLabel);

		// 创建缩放输入框背景
		const scaleInputBg = new Graphics();
		scaleInputBg.roundRect(0, 0, 80, 25, 4);
		scaleInputBg.fill(0xffffff);
		scaleInputBg.stroke({ width: 1, color: 0xcccccc });

		this.scaleInput = new Input({
			bg: scaleInputBg,
			value: '1.0',
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x000000,
				align: 'left'
			}),
			padding: { top: 3, right: 6, bottom: 3, left: 6 },
			align: 'left'
		});
		this.scaleInput.x = 50;
		this.scaleInput.y = 25;
		contentContainer.addChild(this.scaleInput);

		// 添加缩放输入框事件监听
		this.scaleInput.onEnter.connect((text: string) => {
			const scale = parseFloat(text);
			if (!isNaN(scale) && scale > 0 && this.selectedResGroup) {
				this.selectedResGroup.setScale(scale);
			}
		});

		// 删除按钮
		const deleteButtonBg = new Graphics();
		deleteButtonBg.roundRect(0, 0, 80, 30, 6);
		deleteButtonBg.fill(0xff4444);
		deleteButtonBg.stroke({ width: 2, color: 0xffffff });

		const deleteButtonText = new Text({
			text: '删除',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'center'
			})
		});
		deleteButtonText.anchor.set(0.5);
		deleteButtonText.x = 40;
		deleteButtonText.y = 15;

		const deleteButtonContainer = new Container();
		deleteButtonContainer.addChild(deleteButtonBg);
		deleteButtonContainer.addChild(deleteButtonText);
		deleteButtonContainer.cursor = 'pointer';

		this.deleteButton = new Button(deleteButtonContainer);

		// 删除按钮事件
		this.deleteButton.onPress.connect(() => {
			if (this.selectedResGroup) {
				this.game.removeResGroup(this.selectedResGroup);
				this.hide();
			}
		});

		// 悬停效果
		this.deleteButton.onHover.connect(() => {
			deleteButtonBg.tint = 0xcccccc;
		});

		this.deleteButton.onOut.connect(() => {
			deleteButtonBg.tint = 0xffffff;
		});

		this.deleteButton.onDown.connect(() => {
			deleteButtonBg.tint = 0xaaaaaa;
		});

		this.deleteButton.onUp.connect(() => {
			deleteButtonBg.tint = 0xffffff;
		});

		// 获取按钮的view并设置位置
		const deleteButtonView = this.deleteButton.view;
		deleteButtonView.x = 150;
		deleteButtonView.y = 25;
		contentContainer.addChild(deleteButtonView);

		// 创建动画选择下拉框（初始隐藏）
		this.createAnimationSelector(contentContainer);

		// 创建循环勾选框（初始隐藏）
		this.createLoopCheckbox(contentContainer);

		// 创建相对位置勾选框（初始隐藏）
		this.createRelativePositionCheckbox(contentContainer);

		// 创建播放按钮（初始隐藏）
		this.createPlayButton(contentContainer);

		// 创建对齐选择下拉框（初始隐藏）
		this.createAlignmentSelector(contentContainer);

		// 创建相对坐标显示文本
		this.createRelativePositionTexts(contentContainer);

		// 创建位置坐标显示文本
		this.createPositionTexts(contentContainer);

		// 创建导出按钮
		this.createExportButton(contentContainer);
	}

	private createAnimationSelector(contentContainer: Container) {
		// 动画标签
		this.animationLabel = new Text({
			text: '动画:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		this.animationLabel.x = 250;
		this.animationLabel.y = 25;
		this.animationLabel.visible = false;
		contentContainer.addChild(this.animationLabel);

		// 创建DropDown组件
		this.animationSelect = new DropDown({
			width: 120,
			height: 25,
			backgroundColor: 0xffffff,
			hoverColor: 0xf0f0f0,
			textColor: 0x000000,
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x000000,
				align: 'left'
			}),
			options: [],
			onSelect: (option: DropDownOption) => {
				if (this.selectedResGroup) {
					const loopEnabled = this.selectedResGroup.getLoopEnabled();
					this.selectedResGroup.setSpineAnimation(option.text, loopEnabled);
				}
			}
		});

		// 设置DropDown位置
		this.animationSelect.x = 300;
		this.animationSelect.y = 25;
		this.animationSelect.visible = false;
		contentContainer.addChild(this.animationSelect);
	}

	private createLoopCheckbox(contentContainer: Container) {
		// 循环标签
		this.loopCheckboxLabel = new Text({
			text: '循环:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		this.loopCheckboxLabel.x = 430;
		this.loopCheckboxLabel.y = 25;
		this.loopCheckboxLabel.visible = false;
		contentContainer.addChild(this.loopCheckboxLabel);

		// 创建勾选框容器
		this.loopCheckboxContainer = new Container();
		this.loopCheckboxContainer.x = 470;
		this.loopCheckboxContainer.y = 25;
		this.loopCheckboxContainer.visible = false;

		// 创建勾选框背景
		const checkboxBg = new Graphics();
		checkboxBg.roundRect(0, 0, 20, 20, 3);
		checkboxBg.fill(0xffffff);
		checkboxBg.stroke({ width: 1, color: 0xcccccc });

		// 创建勾选标记
		const checkmark = new Graphics();
		checkmark.stroke({ width: 2, color: 0x000000 });
		checkmark.moveTo(4, 10);
		checkmark.lineTo(8, 14);
		checkmark.moveTo(8, 14);
		checkmark.lineTo(16, 6);
		checkmark.visible = false;

		// 创建选中状态的背景（蓝色）
		const selectedBg = new Graphics();
		selectedBg.roundRect(0, 0, 20, 20, 3);
		selectedBg.fill(0x4a90e2);
		selectedBg.stroke({ width: 1, color: 0x2c5aa0 });
		selectedBg.visible = false;

		this.loopCheckboxContainer.addChild(checkboxBg);
		this.loopCheckboxContainer.addChild(selectedBg);
		this.loopCheckboxContainer.addChild(checkmark);

		// 创建按钮
		this.loopCheckbox = new Button(this.loopCheckboxContainer);
		this.loopCheckboxContainer.cursor = 'pointer';

		// 勾选框点击事件
		this.loopCheckbox.onPress.connect(() => {
			if (this.selectedResGroup) {
				// 切换勾选状态
				const isChecked = checkmark.visible;
				checkmark.visible = !isChecked;
				selectedBg.visible = !isChecked;
				checkboxBg.visible = isChecked;

				// 更新ResGroup的循环状态
				this.selectedResGroup.setLoopEnabled(!isChecked);

				// 重新播放当前动画以应用新的循环设置
				const currentAnimation = this.getCurrentAnimation();
				if (currentAnimation) {
					this.selectedResGroup.setSpineAnimation(currentAnimation, !isChecked);
				}
			}
		});

		// 悬停效果
		this.loopCheckbox.onHover.connect(() => {
			if (checkboxBg.visible) {
				checkboxBg.tint = 0xf0f0f0;
			} else {
				selectedBg.tint = 0x3a7bc8;
			}
		});

		this.loopCheckbox.onOut.connect(() => {
			if (checkboxBg.visible) {
				checkboxBg.tint = 0xffffff;
			} else {
				selectedBg.tint = 0xffffff;
			}
		});

		contentContainer.addChild(this.loopCheckboxContainer);
	}

	private createRelativePositionCheckbox(contentContainer: Container) {
		// 相对位置标签
		this.relativeCheckboxLabel = new Text({
			text: '相对位置:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		this.relativeCheckboxLabel.x = 580 + 40 + 340;
		this.relativeCheckboxLabel.y = 40;
		this.relativeCheckboxLabel.visible = true;
		contentContainer.addChild(this.relativeCheckboxLabel);

		// 勾选框容器
		this.relativeCheckboxContainer = new Container();
		this.relativeCheckboxContainer.x = 650 + 40 + 340;
		this.relativeCheckboxContainer.y = 40;
		this.relativeCheckboxContainer.visible = true;

		// 创建勾选框背景
		const checkboxBg = new Graphics();
		checkboxBg.roundRect(0, 0, 20, 20, 3);
		checkboxBg.fill(0xffffff);
		checkboxBg.stroke({ width: 1, color: 0xcccccc });

		// 创建勾选标记
		const checkmark = new Graphics();
		checkmark.stroke({ width: 2, color: 0x000000 });
		checkmark.moveTo(4, 10);
		checkmark.lineTo(8, 14);
		checkmark.moveTo(8, 14);
		checkmark.lineTo(16, 6);
		checkmark.visible = false;

		// 选中背景
		const selectedBg = new Graphics();
		selectedBg.roundRect(0, 0, 20, 20, 3);
		selectedBg.fill(0x4a90e2);
		selectedBg.stroke({ width: 1, color: 0x2c5aa0 });
		selectedBg.visible = false;

		this.relativeCheckboxContainer.addChild(checkboxBg);
		this.relativeCheckboxContainer.addChild(selectedBg);
		this.relativeCheckboxContainer.addChild(checkmark);

		this.relativeCheckbox = new Button(this.relativeCheckboxContainer);
		this.relativeCheckboxContainer.cursor = 'pointer';

		// 点击切换相对位置模式
		this.relativeCheckbox.onPress.connect(() => {
			if (this.selectedResGroup) {
				const isChecked = checkmark.visible;
				checkmark.visible = !isChecked;
				selectedBg.visible = !isChecked;
				checkboxBg.visible = isChecked;
				this.selectedResGroup.setUseRelativePosition(!isChecked);
			}
		});

		this.relativeCheckbox.onHover.connect(() => {
			if (checkboxBg.visible) {
				checkboxBg.tint = 0xf0f0f0;
			} else {
				selectedBg.tint = 0x3a7bc8;
			}
		});

		this.relativeCheckbox.onOut.connect(() => {
			if (checkboxBg.visible) {
				checkboxBg.tint = 0xffffff;
			} else {
				selectedBg.tint = 0xffffff;
			}
		});

		contentContainer.addChild(this.relativeCheckboxContainer);
	}

	private createPlayButton(contentContainer: Container) {
		// 播放按钮标签
		this.playButtonLabel = new Text({
			text: '播放:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		this.playButtonLabel.x = 500;
		this.playButtonLabel.y = 25;
		this.playButtonLabel.visible = false;
		contentContainer.addChild(this.playButtonLabel);

		// 创建播放按钮背景
		const playButtonBg = new Graphics();
		playButtonBg.roundRect(0, 0, 60, 25, 4);
		playButtonBg.fill(0x4a90e2);
		playButtonBg.stroke({ width: 1, color: 0x2c5aa0 });

		// 创建播放按钮文本
		const playButtonText = new Text({
			text: '播放',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0xffffff,
				align: 'center'
			})
		});
		playButtonText.anchor.set(0.5);
		playButtonText.x = 30;
		playButtonText.y = 12.5;

		// 创建播放按钮容器
		const playButtonContainer = new Container();
		playButtonContainer.addChild(playButtonBg);
		playButtonContainer.addChild(playButtonText);
		playButtonContainer.cursor = 'pointer';
		playButtonContainer.x = 540;
		playButtonContainer.y = 25;
		playButtonContainer.visible = false;

		// 创建按钮
		this.playButton = new Button(playButtonContainer);

		// 播放按钮点击事件
		this.playButton.onPress.connect(() => {
			if (this.selectedResGroup) {
				// 获取当前选中的动画
				const currentAnimation = this.getCurrentAnimation();
				if (currentAnimation) {
					// 重新播放当前动画
					const loopEnabled = this.selectedResGroup.getLoopEnabled();
					this.selectedResGroup.setSpineAnimation(currentAnimation, loopEnabled);
				}
			}
		});

		// 悬停效果
		this.playButton.onHover.connect(() => {
			playButtonBg.tint = 0x3a7bc8;
		});

		this.playButton.onOut.connect(() => {
			playButtonBg.tint = 0xffffff;
		});

		this.playButton.onDown.connect(() => {
			playButtonBg.tint = 0x2c5aa0;
		});

		this.playButton.onUp.connect(() => {
			playButtonBg.tint = 0xffffff;
		});

		contentContainer.addChild(playButtonContainer);
	}

	private getCurrentAnimation(): string | null {
		if (this.animationSelect && this.animationSelect.getSelectedOption()) {
			return this.animationSelect.getSelectedOption()!.text;
		}
		return null;
	}

	private createAlignmentSelector(contentContainer: Container) {
		// 对齐标签
		this.alignmentLabel = new Text({
			text: '对齐:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		this.alignmentLabel.x = 440;
		this.alignmentLabel.y = 25;
		this.alignmentLabel.visible = false;
		contentContainer.addChild(this.alignmentLabel);

		// 创建对齐选项
		const alignmentOptions: DropDownOption[] = [
			{ id: 0, text: '顶部中心' },
			{ id: 1, text: '中心' },
			{ id: 2, text: '底部中心' }
		];

		// 创建DropDown组件
		this.alignmentSelect = new DropDown({
			width: 120,
			height: 25,
			backgroundColor: 0xffffff,
			hoverColor: 0xf0f0f0,
			textColor: 0x000000,
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x000000,
				align: 'left'
			}),
			options: [],
			onSelect: (option: DropDownOption) => {
				if (this.selectedResGroup) {
					// 根据选项设置对齐方式
					switch (option.id) {
						case 0: // 顶部中心
							this.selectedResGroup.setImagePivot(0.5, 0);
							break;
						case 1: // 中心
							this.selectedResGroup.setImagePivot(0.5, 0.5);
							break;
						case 2: // 底部中心
							this.selectedResGroup.setImagePivot(0.5, 1);
							break;
					}
				}
			}
		});

		// 设置选项并更新显示
		this.alignmentSelect.setOptions(alignmentOptions);
		// 设置默认选项为"中心"
		this.alignmentSelect.setSelectedOption(alignmentOptions[1]);

		// 设置DropDown位置
		this.alignmentSelect.x = 490;
		this.alignmentSelect.y = 25;
		this.alignmentSelect.visible = false;
		contentContainer.addChild(this.alignmentSelect);
	}

	private createRelativePositionTexts(contentContainer: Container) {
		// 相对X坐标标签
		const relativeXLabel = new Text({
			text: '相对X:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		relativeXLabel.x = 720;
		relativeXLabel.y = 25;
		relativeXLabel.visible = false;
		contentContainer.addChild(relativeXLabel);

		// 创建相对X输入框背景
		const relativeXInputBg = new Graphics();
		relativeXInputBg.roundRect(0, 0, 50, 20, 4);
		relativeXInputBg.fill(0x333333);
		relativeXInputBg.stroke({ width: 1, color: 0x666666 });

		// 相对X坐标输入框
		this.relativeXInput = new Input({
			bg: relativeXInputBg,
			value: '0.0',
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0xffff00,
				align: 'left'
			}),
			padding: { top: 2, right: 4, bottom: 2, left: 4 },
			align: 'left'
		});
		this.relativeXInput.x = 770;
		this.relativeXInput.y = 25;
		this.relativeXInput.visible = false;
		contentContainer.addChild(this.relativeXInput);

		// 添加相对X输入框值变化监听器
		this.relativeXInput.onChange.connect((value: string) => {
			if (this.selectedResInstance) {
				const numValue = parseFloat(value);
				if (!isNaN(numValue)) {
					// 直接设置相对X坐标
					(this.selectedResInstance as any).relativeX = numValue;
					// 更新容器位置
					const groupX = this.selectedResGroup?.getX() || 0;
					this.selectedResInstance.container.x = groupX + numValue;
				}
			}
		});

		// 相对Y坐标标签
		const relativeYLabel = new Text({
			text: '相对Y:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		relativeYLabel.x = 820;
		relativeYLabel.y = 25;
		relativeYLabel.visible = false;
		contentContainer.addChild(relativeYLabel);

		// 创建相对Y输入框背景
		const relativeYInputBg = new Graphics();
		relativeYInputBg.roundRect(0, 0, 50, 20, 4);
		relativeYInputBg.fill(0x333333);
		relativeYInputBg.stroke({ width: 1, color: 0x666666 });

		// 相对Y坐标输入框
		this.relativeYInput = new Input({
			bg: relativeYInputBg,
			value: '0.0',
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0xffff00,
				align: 'left'
			}),
			padding: { top: 2, right: 4, bottom: 2, left: 4 },
			align: 'left'
		});
		this.relativeYInput.x = 870;
		this.relativeYInput.y = 25;
		this.relativeYInput.visible = false;
		contentContainer.addChild(this.relativeYInput);

		// 添加相对Y输入框值变化监听器
		this.relativeYInput.onChange.connect((value: string) => {
			if (this.selectedResInstance) {
				const numValue = parseFloat(value);
				if (!isNaN(numValue)) {
					// 直接设置相对Y坐标
					(this.selectedResInstance as any).relativeY = numValue;
					// 更新容器位置
					const groupY = this.selectedResGroup?.getY() || 0;
					this.selectedResInstance.container.y = groupY + numValue;
				}
			}
		});
	}

	private createPositionTexts(contentContainer: Container) {
		// 位置X坐标标签
		const positionXLabel = new Text({
			text: '位置X:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		positionXLabel.x = 720;
		positionXLabel.y = 0;
		positionXLabel.visible = false;
		contentContainer.addChild(positionXLabel);

		// 创建位置X输入框背景
		const positionXInputBg = new Graphics();
		positionXInputBg.roundRect(0, 0, 50, 20, 4);
		positionXInputBg.fill(0x333333);
		positionXInputBg.stroke({ width: 1, color: 0x666666 });

		// 位置X坐标输入框
		this.positionXInput = new Input({
			bg: positionXInputBg,
			value: '0.0',
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x00ff00,
				align: 'left'
			}),
			padding: { top: 2, right: 4, bottom: 2, left: 4 },
			align: 'left'
		});
		this.positionXInput.x = 720 + 50;
		this.positionXInput.y = 0;
		this.positionXInput.visible = false;
		contentContainer.addChild(this.positionXInput);

		// 添加位置X输入框值变化监听器
		this.positionXInput.onChange.connect((value: string) => {
			if (this.selectedResGroup) {
				const numValue = parseFloat(value);
				if (!isNaN(numValue)) {
					// 设置用户输入标志
					this.isUserInput = true;
					// 获取当前Y坐标
					const currentY = this.selectedResGroup.getY();
					// 使用setPosition方法更新位置
					this.selectedResGroup.setPosition(numValue, currentY);
					// 重置用户输入标志
					this.isUserInput = false;
				}
			}
		});

		// 位置Y坐标标签
		const positionYLabel = new Text({
			text: '位置Y:',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'left'
			})
		});
		positionYLabel.x = 720 + 100;
		positionYLabel.y = 0;
		positionYLabel.visible = false;
		contentContainer.addChild(positionYLabel);

		// 创建位置Y输入框背景
		const positionYInputBg = new Graphics();
		positionYInputBg.roundRect(0, 0, 50, 20, 4);
		positionYInputBg.fill(0x333333);
		positionYInputBg.stroke({ width: 1, color: 0x666666 });

		// 位置Y坐标输入框
		this.positionYInput = new Input({
			bg: positionYInputBg,
			value: '0.0',
			textStyle: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 12,
				fill: 0x00ff00,
				align: 'left'
			}),
			padding: { top: 2, right: 4, bottom: 2, left: 4 },
			align: 'left'
		});
		this.positionYInput.x = 720 + 150;
		this.positionYInput.y = 0;
		this.positionYInput.visible = false;
		contentContainer.addChild(this.positionYInput);

		// 添加位置Y输入框值变化监听器
		this.positionYInput.onChange.connect((value: string) => {
			if (this.selectedResGroup) {
				const numValue = parseFloat(value);
				if (!isNaN(numValue)) {
					// 设置用户输入标志
					this.isUserInput = true;
					// 获取当前X坐标
					const currentX = this.selectedResGroup.getX();
					// 使用setPosition方法更新位置
					this.selectedResGroup.setPosition(currentX, numValue);
					// 重置用户输入标志
					this.isUserInput = false;
				}
			}
		});
	}

	private createExportButton(contentContainer: Container) {
		// 创建导出按钮背景
		const exportButtonBg = new Graphics();
		exportButtonBg.roundRect(0, 0, 120, 30, 6);
		exportButtonBg.fill(0x4a90e2);
		exportButtonBg.stroke({ width: 2, color: 0xffffff });

		// 创建导出按钮文本
		const exportButtonText = new Text({
			text: '导出相对位置',
			style: new TextStyle({
				fontFamily: 'Arial',
				fontSize: 14,
				fill: 0xffffff,
				align: 'center'
			})
		});
		exportButtonText.anchor.set(0.5);
		exportButtonText.x = 60;
		exportButtonText.y = 15;

		// 创建导出按钮容器
		const exportButtonContainer = new Container();
		exportButtonContainer.addChild(exportButtonBg);
		exportButtonContainer.addChild(exportButtonText);
		exportButtonContainer.cursor = 'pointer';
		exportButtonContainer.x = 720 + 240;
		exportButtonContainer.y = 0;

		// 创建按钮
		this.exportButton = new Button(exportButtonContainer);

		// 导出按钮点击事件
		this.exportButton.onPress.connect(() => {
			if (this.selectedResGroup) {
				this.showExportModal();
			}
		});

		// 悬停效果
		this.exportButton.onHover.connect(() => {
			exportButtonBg.tint = 0x3a7bc8;
		});

		this.exportButton.onOut.connect(() => {
			exportButtonBg.tint = 0xffffff;
		});

		this.exportButton.onDown.connect(() => {
			exportButtonBg.tint = 0x2c5aa0;
		});

		this.exportButton.onUp.connect(() => {
			exportButtonBg.tint = 0xffffff;
		});

		contentContainer.addChild(exportButtonContainer);
	}

	private showExportModal() {
		if (!this.selectedResGroup) return;

		// 获取所有instance的坐标数据
		const instancesData = this.getInstancesData();

		// 创建模态框HTML
		const modalHtml = `
			<div id="exportModal" style="
				position: fixed;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.5);
				display: flex;
				justify-content: center;
				align-items: center;
				z-index: 10000;
			">
				<div style="
					background-color: white;
					border-radius: 8px;
					box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
					width: 500px;
					height: 400px;
					display: flex;
					flex-direction: column;
				">
					<div style="
						padding: 20px 20px 0 20px;
						flex-shrink: 0;
					">
						<h3 style="margin-top: 0; color: #333;">导出坐标数据</h3>
					</div>
					<div style="
						flex: 1;
						padding: 0 20px;
						overflow-y: auto;
					">
						<pre id="exportData" style="
							background-color: #f5f5f5;
							padding: 15px;
							border-radius: 4px;
							overflow-x: auto;
							font-family: monospace;
							font-size: 14px;
							white-space: pre-wrap;
							word-break: break-all;
							margin: 0;
						">${JSON.stringify(instancesData, null, 2)}</pre>
					</div>
					<div style="
						padding: 20px;
						text-align: right;
						flex-shrink: 0;
						border-top: 1px solid #eee;
					">
						<button id="copyButton" style="
							background-color: #4a90e2;
							color: white;
							border: none;
							padding: 10px 20px;
							border-radius: 4px;
							cursor: pointer;
							margin-right: 10px;
						">拷贝</button>
						<button id="closeButton" style="
							background-color: #666;
							color: white;
							border: none;
							padding: 10px 20px;
							border-radius: 4px;
							cursor: pointer;
						">关闭</button>
					</div>
				</div>
			</div>
		`;

		// 添加到页面
		document.body.insertAdjacentHTML('beforeend', modalHtml);

		// 添加事件监听器
		const modal = document.getElementById('exportModal');
		const copyButton = document.getElementById('copyButton');
		const closeButton = document.getElementById('closeButton');

		if (copyButton) {
			copyButton.addEventListener('click', () => {
				const dataText = document.getElementById('exportData')?.textContent || '';
				navigator.clipboard
					.writeText(dataText)
					.then(() => {
						alert('已复制到剪贴板！');
					})
					.catch(() => {
						// 降级方案
						const textArea = document.createElement('textarea');
						textArea.value = dataText;
						document.body.appendChild(textArea);
						textArea.select();
						document.execCommand('copy');
						document.body.removeChild(textArea);
						alert('已复制到剪贴板！');
					});
			});
		}

		if (closeButton) {
			closeButton.addEventListener('click', () => {
				if (modal) {
					modal.remove();
				}
			});
		}

		// 点击背景关闭模态框
		if (modal) {
			modal.addEventListener('click', (e) => {
				if (e.target === modal) {
					modal.remove();
				}
			});
		}
	}

	private getInstancesData() {
		if (!this.selectedResGroup) return [];

		// 获取ResGroup中的所有instance
		const instances = this.selectedResGroup.getInstances();

		// 提取每个instance的relativeX和relativeY，保留3位小数
		return instances.map((instance) => ({
			x: parseFloat(instance.getRelativeX().toFixed(3)),
			y: parseFloat(instance.getRelativeY().toFixed(3))
		}));
	}

	public updateResInstanceCoordinates(resInstance: any) {
		if (this.selectedResInstance === resInstance && this.relativeXInput && this.relativeYInput) {
			const relativeX = resInstance.getRelativeX();
			const relativeY = resInstance.getRelativeY();

			this.relativeXInput.value = relativeX.toFixed(1);
			this.relativeYInput.value = relativeY.toFixed(1);
		}
	}

	public updateResGroupPosition(resGroup: ResGroup) {
		// 只在非拖动状态且非用户输入时更新输入框
		if (
			!this.isDragging &&
			!this.isUserInput &&
			this.selectedResGroup === resGroup &&
			this.positionXInput &&
			this.positionYInput
		) {
			const positionX = resGroup.getX();
			const positionY = resGroup.getY();

			this.positionXInput.value = positionX.toFixed(1);
			this.positionYInput.value = positionY.toFixed(1);
		}
	}

	// 设置拖动状态
	public setDragging(isDragging: boolean) {
		this.isDragging = isDragging;
	}

	public show(resGroup: ResGroup, resInstance?: any) {
		this.selectedResGroup = resGroup;
		this.selectedResInstance = resInstance || null;
		this.container.visible = true;
		this.scaleInput.value = resGroup.getScale().toString();

		// 检查是否为Spine类型，显示或隐藏动画选择器和循环勾选框
		if (resGroup.hasSpineType()) {
			const animations = resGroup.getSpineAnimations();
			if (this.animationLabel && this.animationSelect) {
				this.animationLabel.visible = true;
				this.animationSelect.visible = true;

				// 更新下拉框选项
				const options: DropDownOption[] = animations.map((name, index) => ({
					id: index,
					text: name
				}));
				this.animationSelect.setOptions(options);

				// 设置当前选中的动画
				const currentAnimation = resGroup.getCurrentAnimation();
				if (currentAnimation) {
					const currentOption = options.find((option) => option.text === currentAnimation);
					if (currentOption) {
						this.animationSelect.setSelectedOption(currentOption);
					}
				}
			}

			// 显示循环勾选框
			if (this.loopCheckboxLabel && this.loopCheckboxContainer) {
				this.loopCheckboxLabel.visible = true;
				this.loopCheckboxContainer.visible = true;

				// 同步勾选框状态与ResGroup的循环状态
				const checkboxBg = this.loopCheckboxContainer.children[0] as Graphics;
				const selectedBg = this.loopCheckboxContainer.children[1] as Graphics;
				const checkmark = this.loopCheckboxContainer.children[2] as Graphics;

				const loopEnabled = resGroup.getLoopEnabled();
				checkmark.visible = loopEnabled;
				selectedBg.visible = loopEnabled;
				checkboxBg.visible = !loopEnabled;
			}

			// 显示播放按钮
			if (this.playButtonLabel && this.playButton) {
				this.playButtonLabel.visible = true;
				this.playButton.view.visible = true;
			}
		} else {
			if (this.animationLabel && this.animationSelect) {
				this.animationLabel.visible = false;
				this.animationSelect.visible = false;
			}
			if (this.loopCheckboxLabel && this.loopCheckboxContainer) {
				this.loopCheckboxLabel.visible = false;
				this.loopCheckboxContainer.visible = false;
			}
			if (this.playButtonLabel && this.playButton) {
				this.playButtonLabel.visible = false;
				this.playButton.view.visible = false;
			}
		}

		// 同步相对位置勾选框状态
		if (this.relativeCheckboxContainer) {
			const checkboxBg = this.relativeCheckboxContainer.children[0] as Graphics;
			const selectedBg = this.relativeCheckboxContainer.children[1] as Graphics;
			const checkmark = this.relativeCheckboxContainer.children[2] as Graphics;
			const enabled = (this.selectedResGroup as any).getUseRelativePosition
				? (this.selectedResGroup as any).getUseRelativePosition()
				: false;
			checkmark.visible = enabled;
			selectedBg.visible = enabled;
			checkboxBg.visible = !enabled;
		}

		// 检查是否为图片类型，显示或隐藏对齐选择器
		if (resGroup.hasImageType()) {
			if (this.alignmentLabel && this.alignmentSelect) {
				this.alignmentLabel.visible = true;
				this.alignmentSelect.visible = true;
			}
		} else {
			if (this.alignmentLabel && this.alignmentSelect) {
				this.alignmentLabel.visible = false;
				this.alignmentSelect.visible = false;
			}
		}

		// 显示相对坐标信息
		this.updateRelativePositionDisplay();

		// 显示位置坐标信息
		this.updatePositionDisplay();
	}

	private updateRelativePositionDisplay() {
		if (this.selectedResInstance && this.relativeXInput && this.relativeYInput) {
			const relativeX = this.selectedResInstance.getRelativeX();
			const relativeY = this.selectedResInstance.getRelativeY();

			this.relativeXInput.value = relativeX.toFixed(1);
			this.relativeYInput.value = relativeY.toFixed(1);

			this.relativeXInput.visible = true;
			this.relativeYInput.visible = true;

			// 显示标签
			const contentContainer = this.container.children[2]; // contentContainer是第3个子元素
			const relativeXLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '相对X:'
			) as Text;
			const relativeYLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '相对Y:'
			) as Text;

			if (relativeXLabel) relativeXLabel.visible = true;
			if (relativeYLabel) relativeYLabel.visible = true;
		} else {
			if (this.relativeXInput) this.relativeXInput.visible = false;
			if (this.relativeYInput) this.relativeYInput.visible = false;

			// 隐藏标签
			const contentContainer = this.container.children[2];
			const relativeXLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '相对X:'
			) as Text;
			const relativeYLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '相对Y:'
			) as Text;

			if (relativeXLabel) relativeXLabel.visible = false;
			if (relativeYLabel) relativeYLabel.visible = false;
		}
	}

	private updatePositionDisplay() {
		if (this.selectedResGroup && this.positionXInput && this.positionYInput) {
			const positionX = this.selectedResGroup.getX();
			const positionY = this.selectedResGroup.getY();

			this.positionXInput.value = positionX.toFixed(1);
			this.positionYInput.value = positionY.toFixed(1);

			this.positionXInput.visible = true;
			this.positionYInput.visible = true;

			// 显示标签
			const contentContainer = this.container.children[2]; // contentContainer是第3个子元素
			const positionXLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '位置X:'
			) as Text;
			const positionYLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '位置Y:'
			) as Text;

			if (positionXLabel) positionXLabel.visible = true;
			if (positionYLabel) positionYLabel.visible = true;
		} else {
			if (this.positionXInput) this.positionXInput.visible = false;
			if (this.positionYInput) this.positionYInput.visible = false;

			// 隐藏标签
			const contentContainer = this.container.children[2];
			const positionXLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '位置X:'
			) as Text;
			const positionYLabel = contentContainer.children.find(
				(child) => child instanceof Text && child.text === '位置Y:'
			) as Text;

			if (positionXLabel) positionXLabel.visible = false;
			if (positionYLabel) positionYLabel.visible = false;
		}
	}

	public hide() {
		this.selectedResGroup = null;
		this.selectedResInstance = null;
		this.container.visible = false;

		// 隐藏动画选择器
		if (this.animationSelect) {
			this.animationSelect.visible = false;
		}

		// 隐藏循环勾选框
		if (this.loopCheckboxContainer) {
			this.loopCheckboxContainer.visible = false;
		}

		// 隐藏播放按钮
		if (this.playButtonLabel) {
			this.playButtonLabel.visible = false;
		}
		if (this.playButton) {
			this.playButton.view.visible = false;
		}

		// 隐藏对齐选择器
		if (this.alignmentSelect) {
			this.alignmentSelect.visible = false;
		}
	}

	public updateSize() {
		// 更新信息条背景大小
		const background = this.container.children[0] as Graphics;
		background.clear();
		background.rect(0, 0, window.innerWidth, 80);
		background.fill(0x2a2a2a);

		// 更新分隔线大小
		const separator = this.container.children[1] as Graphics;
		separator.clear();
		separator.rect(0, 0, window.innerWidth, 1);
		separator.fill(0x666666);
	}

	public destroy() {
		// 清理PIXI组件
		if (this.animationSelect) {
			this.animationSelect.destroy();
		}
		if (this.alignmentSelect) {
			this.alignmentSelect.destroy();
		}
	}
}
