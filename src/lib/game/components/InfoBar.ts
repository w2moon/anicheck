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
	private selectedResGroup: ResGroup | null = null;
	private game: Game;

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

		// 创建对齐选择下拉框（初始隐藏）
		this.createAlignmentSelector(contentContainer);
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

	public show(resGroup: ResGroup) {
		this.selectedResGroup = resGroup;
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
		} else {
			if (this.animationLabel && this.animationSelect) {
				this.animationLabel.visible = false;
				this.animationSelect.visible = false;
			}
			if (this.loopCheckboxLabel && this.loopCheckboxContainer) {
				this.loopCheckboxLabel.visible = false;
				this.loopCheckboxContainer.visible = false;
			}
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
	}

	public hide() {
		this.selectedResGroup = null;
		this.container.visible = false;

		// 隐藏动画选择器
		if (this.animationSelect) {
			this.animationSelect.visible = false;
		}

		// 隐藏循环勾选框
		if (this.loopCheckboxContainer) {
			this.loopCheckboxContainer.visible = false;
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
