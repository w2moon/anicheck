import { Texture, Assets } from 'pixi.js';
import { SpineTexture, TextureAtlas, Spine } from '@esotericsoftware/spine-pixi-v8';
import { ResGroup, ResType, type Res } from '../components/ResGroup';
import type { Game } from '../index';

export class SpineLoader {
	constructor(private game: Game) {}

	/**
	 * 加载Spine目录中的所有文件
	 * @param files 文件数组
	 */
	public loadSpineDirectory(files: File[]): void {
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

	/**
	 * 按文件名分组Spine文件
	 * @param files 文件数组
	 * @returns 分组的Spine文件
	 */
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

	/**
	 * 加载多个Spine文件组
	 * @param groups Spine文件组数组
	 */
	private async loadMultipleSpineGroups(
		groups: { name: string; skel: File; atlas: File; png: File[] }[]
	): Promise<void> {
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
				const resGroup = new ResGroup(validResArray, this.game);
				this.game.addResGroup(resGroup);
				console.log(`Spine目录加载完成，创建了包含 ${validResArray.length} 个Spine的ResGroup`);
			}
		}
	}

	/**
	 * 加载单个Spine文件组
	 * @param group Spine文件组
	 * @returns Spine数据或null
	 */
	private async loadSpineGroup(group: {
		name: string;
		skel: File;
		atlas: File;
		png: File[];
	}): Promise<{ skeletonAlias: string; atlasAlias: string; animations: string[] } | null> {
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

			// 创建临时的Spine实例来获取动画列表
			let animations: string[] = [];
			try {
				const tempSpine = Spine.from({
					skeleton: skeletonAlias,
					atlas: atlasAlias
				});

				// 从skeletonData中获取动画列表
				if (tempSpine.skeleton.data && tempSpine.skeleton.data.animations) {
					animations = tempSpine.skeleton.data.animations.map((animation) => animation.name);
				}

				// 销毁临时实例
				tempSpine.destroy();
			} catch (error) {
				console.warn(`获取Spine ${group.name} 的动画列表失败:`, error);
			}

			// 返回Assets别名、textures和动画列表
			return {
				skeletonAlias,
				atlasAlias,
				animations
			};
		} catch (error) {
			console.error(`加载Spine组 ${group.name} 失败:`, error);
			return null;
		}
	}

	/**
	 * 读取文件为ArrayBuffer
	 * @param file 文件
	 * @returns Promise<ArrayBuffer>
	 */
	private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as ArrayBuffer);
			reader.onerror = () => reject(reader.error);
			reader.readAsArrayBuffer(file);
		});
	}

	/**
	 * 读取文件为文本
	 * @param file 文件
	 * @returns Promise<string>
	 */
	private readFileAsText(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsText(file);
		});
	}

	/**
	 * 从文件加载纹理
	 * @param file 图片文件
	 * @returns Promise<Texture>
	 */
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

	/**
	 * 提取文件名中的第一组数字
	 * @param filename 文件名
	 * @returns 数字
	 */
	private extractFirstNumber(filename: string): number {
		// 提取文件名中的第一组数字
		const match = filename.match(/\d+/);
		return match ? parseInt(match[0], 10) : 0;
	}
}
