import { Texture } from 'pixi.js';
import { ResGroup, ResType, type Res } from '../components/ResGroup';
import type { Game } from '../index';

export class ImageLoader {
	constructor(private game: Game) {}

	/**
	 * 加载并显示单个图片文件
	 * @param file 图片文件
	 */
	public loadAndDisplayImage(file: File): void {
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

	/**
	 * 加载多个图片文件
	 * @param files 图片文件数组
	 */
	public loadMultipleImages(files: File[]): void {
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

	/**
	 * 按文件名中的数字排序文件
	 * @param files 文件数组
	 * @returns 排序后的文件数组
	 */
	public sortFilesByNumber(files: File[]): File[] {
		return files.sort((a, b) => {
			const numA = this.extractFirstNumber(a.name);
			const numB = this.extractFirstNumber(b.name);
			return numA - numB;
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
