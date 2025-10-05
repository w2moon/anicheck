import { Container, Graphics, Text, TextStyle, Sprite, Texture, Assets } from 'pixi.js';
import { Button, Input } from '@pixi/ui';
import { config } from '../config';
import { ResGroup, ResType, type Res } from './ResGroup';
import type { Game } from '../index';
import { Spine, SpineTexture, TextureAtlas } from '@esotericsoftware/spine-pixi-v8';

export class TopBar {
	private container!: Container;
	private widthInput!: Input;
	private heightInput!: Input;
	private app: any;
	private fileInput!: HTMLInputElement;
	private directoryInput!: HTMLInputElement;
	private game: Game;

	constructor(app: any, game: Game) {
		this.app = app;
		this.game = game;
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
				this.loadAndDisplayDirectory(files);
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

					// 创建Res对象
					const res: Res = {
						type: ResType.Image,
						data: { texture }
					};

					// 创建ResGroup
					const resGroup = new ResGroup([res]);

					// 添加到游戏中的resGroups
					this.game.addResGroup(resGroup);

					console.log('图片已加载并创建ResGroup');
				};
				img.src = imageUrl;
			}
		};
		reader.readAsDataURL(file);
	}

	private loadAndDisplayDirectory(files: FileList) {
		// 将FileList转换为数组
		const allFiles = Array.from(files);

		// 检查是否包含Spine文件
		const hasSpineFiles = allFiles.some(
			(file) => file.name.endsWith('.skel') || file.name.endsWith('.atlas')
		);

		if (hasSpineFiles) {
			// 处理Spine文件
			this.loadSpineDirectory(allFiles);
		} else {
			// 处理图片文件
			const imageFiles = allFiles.filter((file) => file.type.startsWith('image/'));

			if (imageFiles.length === 0) {
				console.log('目录中没有找到图片文件');
				return;
			}

			// 按文件名中的数字排序
			const sortedFiles = this.sortFilesByNumber(imageFiles);

			console.log(`找到 ${sortedFiles.length} 个图片文件，开始加载...`);

			// 加载所有图片
			this.loadMultipleImages(sortedFiles);
		}
	}

	private sortFilesByNumber(files: File[]): File[] {
		return files.sort((a, b) => {
			const numA = this.extractFirstNumber(a.name);
			const numB = this.extractFirstNumber(b.name);
			return numA - numB;
		});
	}

	private extractFirstNumber(filename: string): number {
		// 提取文件名中的第一组数字
		const match = filename.match(/\d+/);
		return match ? parseInt(match[0], 10) : 0;
	}

	private loadMultipleImages(files: File[]) {
		const resArray: Res[] = [];
		let loadedCount = 0;
		const totalCount = files.length;

		files.forEach((file, index) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const imageUrl = e.target?.result as string;
				if (imageUrl) {
					const img = new Image();
					img.onload = () => {
						const texture = Texture.from(img);
						const res: Res = {
							type: ResType.Image,
							data: { texture }
						};
						resArray[index] = res;
						loadedCount++;

						// 所有图片加载完成后创建ResGroup
						if (loadedCount === totalCount) {
							// 过滤掉undefined的元素（防止某些图片加载失败）
							const validResArray = resArray.filter((res) => res !== undefined);
							const resGroup = new ResGroup(validResArray);
							this.game.addResGroup(resGroup);
							console.log(`目录加载完成，创建了包含 ${validResArray.length} 个图片的ResGroup`);
						}
					};
					img.src = imageUrl;
				}
			};
			reader.readAsDataURL(file);
		});
	}

	private loadSpineDirectory(files: File[]) {
		// 按文件名分组Spine文件
		const spineGroups = this.groupSpineFiles(files);

		if (spineGroups.length === 0) {
			console.log('没有找到完整的Spine文件组');
			return;
		}

		console.log(`找到 ${spineGroups.length} 个Spine文件组，开始加载...`);

		// 按文件名中的数字排序
		const sortedGroups = spineGroups.sort((a, b) => {
			const numA = this.extractFirstNumber(a.name);
			const numB = this.extractFirstNumber(b.name);
			return numA - numB;
		});

		// 加载所有Spine文件组
		this.loadMultipleSpineGroups(sortedGroups);
	}

	private groupSpineFiles(files: File[]): { name: string; skel: File; atlas: File; png: File[] }[] {
		const groups: { [key: string]: { skel?: File; atlas?: File; png: File[] } } = {};

		// 按文件名分组
		files.forEach((file) => {
			const baseName = file.name.replace(/\.(skel|atlas|png)$/, '');

			if (!groups[baseName]) {
				groups[baseName] = { png: [] };
			}

			if (file.name.endsWith('.skel')) {
				groups[baseName].skel = file;
			} else if (file.name.endsWith('.atlas')) {
				groups[baseName].atlas = file;
			} else if (file.name.endsWith('.png')) {
				groups[baseName].png.push(file);
			}
		});

		// 过滤出完整的组（必须有skel和atlas文件）
		const completeGroups: { name: string; skel: File; atlas: File; png: File[] }[] = [];

		Object.entries(groups).forEach(([name, group]) => {
			if (group.skel && group.atlas) {
				completeGroups.push({
					name,
					skel: group.skel,
					atlas: group.atlas,
					png: group.png
				});
			}
		});

		return completeGroups;
	}

	private async loadMultipleSpineGroups(
		groups: { name: string; skel: File; atlas: File; png: File[] }[]
	) {
		const resArray: Res[] = [];
		let loadedCount = 0;
		const totalCount = groups.length;

		for (let i = 0; i < groups.length; i++) {
			const group = groups[i];

			try {
				const spineData = await this.loadSpineGroup(group);
				if (spineData) {
					const res: Res = {
						type: ResType.Spine,
						data: spineData
					};
					resArray[i] = res;
				}
			} catch (error) {
				console.error(`加载Spine组 ${group.name} 失败:`, error);
			}

			loadedCount++;

			// 所有Spine组加载完成后创建ResGroup
			if (loadedCount === totalCount) {
				// 过滤掉undefined的元素
				const validResArray = resArray.filter((res) => res !== undefined);
				const resGroup = new ResGroup(validResArray);
				this.game.addResGroup(resGroup);
				console.log(`Spine目录加载完成，创建了包含 ${validResArray.length} 个Spine的ResGroup`);
			}
		}
	}

	private async loadSpineGroup(group: {
		name: string;
		skel: File;
		atlas: File;
		png: File[];
	}): Promise<{ skeletonAlias: string; atlasAlias: string } | null> {
		try {
			// 创建唯一的别名
			const skeletonAlias = `skeleton-${group.name}-${Date.now()}`;
			const atlasAlias = `atlas-${group.name}-${Date.now()}`;

			// 读取skel文件为ArrayBuffer
			const skelArrayBuffer = await this.readFileAsArrayBuffer(group.skel);
			Assets.cache.set(skeletonAlias, new Uint8Array(skelArrayBuffer));

			// 读取atlas文件为文本
			const atlasText = await this.readFileAsText(group.atlas);

			// 解析PNG文件为Texture
			const textures: { [name: string]: Texture } = {};
			for (const pngFile of group.png) {
				const texture = await this.loadTextureFromFile(pngFile);
				textures[pngFile.name] = texture;
			}

			const textureAtlas = new TextureAtlas(atlasText);
			Assets.cache.set(atlasAlias, textureAtlas);

			textureAtlas.pages.forEach((page) => {
				page.setTexture(SpineTexture.from(textures[page.name].source));
			});

			// 返回Assets别名和textures
			return {
				skeletonAlias,
				atlasAlias
			};
		} catch (error) {
			console.error(`加载Spine组 ${group.name} 失败:`, error);
			return null;
		}
	}

	private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = () => reject(reader.error);
			reader.readAsArrayBuffer(file);
		});
	}

	private readFileAsText(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsText(file);
		});
	}

	private loadTextureFromFile(file: File): Promise<Texture> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const imageUrl = e.target?.result as string;
				if (imageUrl) {
					const img = new Image();
					img.onload = () => {
						const texture = Texture.from(img);
						resolve(texture);
					};
					img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
					img.src = imageUrl;
				} else {
					reject(new Error(`Failed to read file: ${file.name}`));
				}
			};
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	public updateSize() {
		// 更新按钮区域背景大小
		const background = this.container.children[0] as Graphics;
		background.clear();
		background.rect(0, 0, window.innerWidth, 100);
		background.fill(0x333333);
	}
}
