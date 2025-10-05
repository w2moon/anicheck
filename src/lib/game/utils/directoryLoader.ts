import { ImageLoader } from './imageLoader';
import { SpineLoader } from './spineLoader';
import type { Game } from '../index';

export class DirectoryLoader {
	private imageLoader: ImageLoader;
	private spineLoader: SpineLoader;

	constructor(private game: Game) {
		this.imageLoader = new ImageLoader(game);
		this.spineLoader = new SpineLoader(game);
	}

	/**
	 * 加载并显示目录中的文件
	 * @param files 文件列表
	 */
	public loadAndDisplayDirectory(files: FileList): void {
		// 将FileList转换为数组
		const allFiles = Array.from(files);

		// 检查是否包含Spine文件
		const hasSpineFiles = allFiles.some(
			(file) => file.name.endsWith('.skel') || file.name.endsWith('.atlas')
		);

		if (hasSpineFiles) {
			// 处理Spine文件
			this.spineLoader.loadSpineDirectory(allFiles);
		} else {
			// 处理图片文件
			const imageFiles = allFiles.filter((file) => file.type.startsWith('image/'));

			if (imageFiles.length === 0) {
				console.log('目录中没有找到图片文件');
				return;
			}

			// 按文件名中的数字排序
			const sortedFiles = this.imageLoader.sortFilesByNumber(imageFiles);

			console.log(`找到 ${sortedFiles.length} 个图片文件，开始加载...`);

			// 加载所有图片
			this.imageLoader.loadMultipleImages(sortedFiles);
		}
	}
}
