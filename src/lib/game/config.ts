// 默认配置
const defaultConfig = {
	rowAmount: 4,
	unitWidth: 750,
	unitHeight: 691
};

// 从localStorage加载配置
function loadConfigFromStorage() {
	try {
		const savedConfig = localStorage.getItem('anicheck-config');
		if (savedConfig) {
			const parsedConfig = JSON.parse(savedConfig);
			// 合并保存的配置和默认配置，确保所有字段都存在
			return {
				...defaultConfig,
				...parsedConfig
			};
		}
	} catch (error) {
		console.warn('加载配置失败，使用默认配置:', error);
	}
	return defaultConfig;
}

// 保存配置到localStorage
export function saveConfigToStorage() {
	try {
		localStorage.setItem('anicheck-config', JSON.stringify(config));
	} catch (error) {
		console.warn('保存配置失败:', error);
	}
}

// 导出配置对象
export const config = loadConfigFromStorage();
