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
					this.selectedResGroup.setSpineAnimation(option.text, true);
				}
			}
		});

		// 设置DropDown位置
		this.animationSelect.x = 300;
		this.animationSelect.y = 25;
		this.animationSelect.visible = false;
		contentContainer.addChild(this.animationSelect);
	}

	public show(resGroup: ResGroup) {
		this.selectedResGroup = resGroup;
		this.container.visible = true;
		this.scaleInput.value = resGroup.getScale().toString();

		// 检查是否为Spine类型，显示或隐藏动画选择器
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
		} else {
			if (this.animationLabel && this.animationSelect) {
				this.animationLabel.visible = false;
				this.animationSelect.visible = false;
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
	}
}
