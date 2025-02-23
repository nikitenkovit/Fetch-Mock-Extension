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
				injectContentScript(mockPath, mockData);
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
async function injectContentScript(mockPath, mockData) {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab) {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				func: overrideFetch,
				args: [mockPath, mockData], // Передаем данные в функцию
				world: 'MAIN', // Внедряем в контекст страницы
			});
			console.log('Content script успешно внедрен на вкладку:', tab.url);
		} else {
			console.error('Активная вкладка не найдена.');
		}
	} catch (error) {
		console.error('Ошибка при внедрении content script:', error);
	}
}

// Функция для переопределения fetch
function overrideFetch(mockPath, mockData) {
	console.log('Перехват fetch-запросов активирован.');
	console.log('Данные из хранилища:', { mockPath, mockData });

	// Сохраняем оригинальный fetch
	const originalFetch = window.fetch;

	// Переопределяем fetch
	window.fetch = async (input, init) => {
		const url = typeof input === 'string' ? input : input.url;
		console.log('Обнаружен fetch-запрос:', url);

		// Проверяем, содержит ли URL часть, указанную в mockPath
		if (mockPath && url.includes(mockPath)) {
			console.log('Перехвачен запрос:', url);
			console.log('Возвращаем mock-данные:', mockData);
			return new Response(mockData, {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Если запрос не должен быть перехвачен, выполняем оригинальный fetch
		console.log('Запрос не перехвачен, выполняется оригинальный fetch.');
		return originalFetch(input, init);
	};

	// Проверка, что fetch переопределен
	console.log('window.fetch переопределен:', window.fetch !== originalFetch);
}
