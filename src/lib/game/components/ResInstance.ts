import type { Res, ResGroup, ResSpine } from './ResGroup';
import { ResType } from './ResGroup';
import { Container, Sprite, Assets } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import type { Game } from '../index';

export class ResInstance {
	container: Container;
	private sprite?: Sprite;
	private spine?: Spine;
	private isDragging: boolean = false;
	private dragStartX: number = 0;
	private dragStartY: number = 0;
	private initialX: number = 0;
	private initialY: number = 0;

	private relativeX: number = 0;
	private relativeY: number = 0;

	constructor(
		private res: Res,
		private resGroup: ResGroup,
		private game?: Game
	) {
		this.container = new Container();
		this.createResource();
		this.setupDragEvents();
	}

	getRelativeX(): number {
		return this.relativeX;
	}

	getRelativeY(): number {
		return this.relativeY;
	}

	private async createResource() {
		switch (this.res.type) {
			case ResType.Image:
				this.createImageResource();
				break;
			case ResType.Spine:
				await this.createSpineResource();
				break;
			default:
				console.warn('未知的资源类型:', this.res.type);
		}
	}

	private createImageResource() {
		const imageData = this.res.data as any; // ResImage
		if (imageData.texture) {
			this.sprite = new Sprite(imageData.texture);
			this.container.addChild(this.sprite);

			// 设置精灵居中
			this.sprite.anchor.set(0.5, 0.5);
			this.sprite.x = 0;
			this.sprite.y = 0;
		}
	}

	private async createSpineResource() {
		const spineData = this.res.data as ResSpine;
		if (spineData.skeletonAlias && spineData.atlasAlias) {
			try {
				// 直接使用已加载的Assets别名创建Spine实例
				this.spine = Spine.from({
					skeleton: spineData.skeletonAlias,
					atlas: spineData.atlasAlias
				});

				if (this.spine) {
					// 将Spine作为子元素添加到容器中
					this.container.addChild(this.spine);

					// 设置Spine居中
					this.spine.x = 0;
					this.spine.y = 0;

					// 检查动画完整性
					this.checkSpineAnimations(spineData);

					// 播放ResGroup中记录的当前动画，如果没有则播放第一个动画
					const animations = this.getSpineAnimations();
					if (animations.length > 0) {
						const currentAnimation = this.resGroup.getCurrentAnimation();
						const animationToPlay =
							currentAnimation && animations.includes(currentAnimation)
								? currentAnimation
								: animations[0];
						const loopEnabled = this.resGroup.getLoopEnabled();
						this.spine.state.setAnimation(0, animationToPlay, loopEnabled);
					}
				} else {
					console.error('Spine.from 返回了 undefined');
				}
			} catch (error) {
				console.error('创建Spine资源失败:', error);
				console.error('skeletonAlias:', spineData.skeletonAlias);
				console.error('atlasAlias:', spineData.atlasAlias);
			}
		} else {
			console.error('缺少必要的Spine数据:', spineData);
		}
	}

	/**
	 * 检查Spine动画完整性
	 * @param spineData Spine数据
	 */
	private checkSpineAnimations(spineData: ResSpine): void {
		if (!this.spine) {
			return;
		}

		// 获取ResGroup中第0个spine的动画列表作为基准
		const baseAnimations = this.resGroup.getSpineAnimations();
		if (baseAnimations.length === 0) {
			return;
		}

		// 获取当前spine的实际动画列表
		const actualAnimations: string[] = [];
		if (this.spine.skeleton.data && this.spine.skeleton.data.animations) {
			this.spine.skeleton.data.animations.forEach((animation) => {
				actualAnimations.push(animation.name);
			});
		}

		// 检查是否所有基准动画都存在
		const missingAnimations: string[] = [];
		baseAnimations.forEach((animName) => {
			if (!actualAnimations.includes(animName)) {
				missingAnimations.push(animName);
			}
		});

		// 如果有缺失的动画，弹出警告
		if (missingAnimations.length > 0) {
			const spineName = spineData.skeletonAlias.replace(/^skeleton-/, '').replace(/-\d+$/, '');
			const message = `Spine资源 "${spineName}" 缺少以下动画：\n${missingAnimations.join(', ')}`;
			alert(message);
			console.warn(message);
		}
	}

	/**
	 * 获取Spine的动画列表
	 * @returns 动画名称数组
	 */
	public getSpineAnimations(): string[] {
		if (this.res.type === ResType.Spine) {
			const spineData = this.res.data as ResSpine;
			return spineData.animations || [];
		}
		return [];
	}

	/**
	 * 设置Spine动画
	 * @param animationName 动画名称
	 * @param loop 是否循环播放
	 */
	public setSpineAnimation(animationName: string, loop: boolean = true): void {
		if (this.res.type === ResType.Spine && this.spine) {
			this.spine.state.setAnimation(0, animationName, loop);
		}
	}

	/**
	 * 检查是否为Spine类型
	 * @returns 是否为Spine类型
	 */
	public isSpineType(): boolean {
		return this.res.type === ResType.Spine;
	}

	/**
	 * 检查是否为图片类型
	 * @returns 是否为图片类型
	 */
	public isImageType(): boolean {
		return this.res.type === ResType.Image;
	}

	/**
	 * 设置图片的锚点（对齐方式）
	 * @param anchorX X轴锚点 (0-1)
	 * @param anchorY Y轴锚点 (0-1)
	 */
	public setPivot(anchorX: number, anchorY: number): void {
		if (this.res.type === ResType.Image && this.sprite) {
			this.sprite.anchor.set(anchorX, anchorY);
		}
	}

	private setupDragEvents() {
		// 设置容器为可交互
		this.container.eventMode = 'static';
		this.container.cursor = 'pointer';

		// 鼠标按下事件
		this.container.on('pointerdown', (event) => {
			this.isDragging = true;
			this.dragStartX = event.global.x;
			this.dragStartY = event.global.y;

			// 根据是否使用相对位置来设置初始位置
			if (
				(this.resGroup as any).getUseRelativePosition &&
				(this.resGroup as any).getUseRelativePosition()
			) {
				// 相对位置模式：记录当前容器的绝对位置
				this.initialX = this.container.x;
				this.initialY = this.container.y;
			} else {
				// 非相对位置模式：记录组的基准位置，而不是容器的实际位置
				this.initialX = (this.resGroup as any).getX ? (this.resGroup as any).getX() : 0;
				this.initialY = (this.resGroup as any).getY ? (this.resGroup as any).getY() : 0;
			}

			// 选择当前对象组并显示ResInstance坐标信息
			if (this.game) {
				this.game.selectResGroup(this.resGroup);
				// 通知InfoBar显示当前ResInstance的坐标信息
				const infoBar = this.game.getInfoBar();
				if (infoBar) {
					infoBar.show(this.resGroup, this);
					// 设置拖动状态
					infoBar.setDragging(true);
				}
			}

			// 在全局监听鼠标移动和释放事件
			this.setupGlobalDragEvents();
		});

		// 鼠标释放事件
		this.container.on('pointerup', () => {
			this.stopDragging();
		});

		// 鼠标离开事件（防止拖拽时鼠标离开元素导致无法释放）
		this.container.on('pointerupoutside', () => {
			this.stopDragging();
		});
	}

	private setupGlobalDragEvents() {
		// 在全局监听鼠标移动事件
		const onGlobalPointerMove = (event: PointerEvent) => {
			if (this.isDragging) {
				// 获取ContainerUnit的缩放因子
				const containerUnitScale = this.getContainerUnitScale();

				const deltaX = (event.clientX - this.dragStartX) / containerUnitScale;
				const deltaY = (event.clientY - this.dragStartY) / containerUnitScale;

				const newX = this.initialX + deltaX;
				const newY = this.initialY + deltaY;

				// 如果启用相对位置：更新相对坐标；否则更新组位置
				if (
					(this.resGroup as any).getUseRelativePosition &&
					(this.resGroup as any).getUseRelativePosition()
				) {
					// 基于当前组的绝对基准点，修改本实例的相对偏移
					const groupX = (this.resGroup as any).getX ? (this.resGroup as any).getX() : 0;
					const groupY = (this.resGroup as any).getY ? (this.resGroup as any).getY() : 0;
					this.relativeX = newX - groupX;
					this.relativeY = newY - groupY;
					this.container.x = groupX + this.relativeX;
					this.container.y = groupY + this.relativeY;

					// 实时更新InfoBar中的坐标显示
					if (this.game) {
						const infoBar = this.game.getInfoBar();
						if (infoBar) {
							infoBar.updateResInstanceCoordinates(this);
						}
					}
				} else {
					// 非相对位置模式：直接设置组的位置
					// 注意：这里使用newX和newY作为组的基准位置，而不是容器的实际位置
					this.resGroup.setPosition(newX, newY);

					// 实时更新InfoBar中的位置坐标显示
					if (this.game) {
						const infoBar = this.game.getInfoBar();
						if (infoBar) {
							infoBar.updateResGroupPosition(this.resGroup);
						}
					}
				}
			}
		};

		const onGlobalPointerUp = () => {
			this.stopDragging();
		};

		// 添加全局事件监听器
		document.addEventListener('pointermove', onGlobalPointerMove);
		document.addEventListener('pointerup', onGlobalPointerUp);

		// 保存事件监听器引用，以便后续移除
		(this as any).globalPointerMove = onGlobalPointerMove;
		(this as any).globalPointerUp = onGlobalPointerUp;
	}

	private stopDragging() {
		if (this.isDragging) {
			this.isDragging = false;

			// 通知InfoBar结束拖动状态
			if (this.game) {
				const infoBar = this.game.getInfoBar();
				if (infoBar) {
					infoBar.setDragging(false);
				}
			}

			// 移除全局事件监听器
			if ((this as any).globalPointerMove) {
				document.removeEventListener('pointermove', (this as any).globalPointerMove);
				(this as any).globalPointerMove = null;
			}
			if ((this as any).globalPointerUp) {
				document.removeEventListener('pointerup', (this as any).globalPointerUp);
				(this as any).globalPointerUp = null;
			}
		}
	}

	public isResGroup(resGroup: ResGroup) {
		return this.resGroup === resGroup;
	}

	public getResGroup() {
		return this.resGroup;
	}

	/**
	 * 获取ContainerUnit的缩放因子
	 * @returns ContainerUnit的缩放因子
	 */
	private getContainerUnitScale(): number {
		// 通过容器的父级找到ContainerUnit的缩放因子
		let current = this.container.parent;
		while (current) {
			if (current.label === 'ContainerUnit') {
				return current.scale.x; // 假设x和y缩放相同
			}
			current = current.parent;
		}
		return 1; // 默认缩放因子为1
	}

	public destroy() {
		// 停止拖拽并清理全局事件监听器
		this.stopDragging();

		// 销毁容器
		if (this.container) {
			this.container.destroy();
		}
	}
}
