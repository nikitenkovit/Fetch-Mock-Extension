let isActive = false;
let mockPath = '';
let mockData = '';

// Получаем данные из хранилища
chrome.storage.local.get(['path', 'data', 'isActive'], (result) => {
	mockPath = result.path || '';
	mockData = result.data || '';
	isActive = result.isActive || false;
	console.log('Данные загружены из хранилища:', {
		mockPath,
		mockData,
		isActive,
	});
});

// Обработка сообщений из popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log('Получено сообщение:', message);

	if (message.action === 'activate') {
		isActive = true;
		mockPath = message.path;
		mockData = message.data;

		// Сохраняем данные в хранилище
		chrome.storage.local.set(
			{ path: mockPath, data: mockData, isActive },
			() => {
				console.log('Данные сохранены в хранилище:', {
					mockPath,
					mockData,
					isActive,
				});
				injectContentScript();
			}
		);
	} else if (message.action === 'deactivate') {
		isActive = false;
		mockPath = '';
		mockData = '';
		console.log('Деактивирован перехват запросов.');
	}
});

// Внедрение content script на активную вкладку
async function injectContentScript() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab) {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				files: ['content.js'],
			});
			console.log('Content script успешно внедрен на вкладку:', tab.url);
		} else {
			console.error('Активная вкладка не найдена.');
		}
	} catch (error) {
		console.error('Ошибка при внедрении content script:', error);
	}
}
