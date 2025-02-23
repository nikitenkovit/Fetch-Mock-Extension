let isActive = false;
let mockPath = '';
let mockData = '';

// Загружаем данные при старте
chrome.storage.local.get(['path', 'data', 'isActive'], (result) => {
	mockPath = result.path || '';
	mockData = result.data || '';
	isActive = result.isActive || false;
	console.log('Данные загружены из хранилища:', {
		mockPath,
		mockData,
		isActive,
	});

	if (isActive) {
		injectContentScriptWithRetry(mockPath, mockData);
	}
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
				restoreOriginalFetch().then(() => {
					injectContentScriptWithRetry(mockPath, mockData);
				});
			}
		);
	} else if (message.action === 'deactivate') {
		isActive = false;
		mockPath = '';
		mockData = '';
		console.log('Деактивирован перехват запросов.');
		chrome.storage.local.set({ isActive: false });

		// Восстанавливаем оригинальный fetch
		restoreOriginalFetch();
	}
});

// Внедрение скрипта с активацией вкладки
async function injectContentScriptWithRetry(mockPath, mockData) {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab) {
			// "Будим" вкладку, выполняя простой скрипт
			await wakeUpTab(tab.id);
			await injectScript(mockPath, mockData, tab.id);
		} else {
			console.error('Активная вкладка не найдена.');
		}
	} catch (error) {
		console.error('Ошибка при поиске активной вкладки:', error);
	}
}

// Функция для "пробуждения" вкладки
async function wakeUpTab(tabId) {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			func: () => {
				console.log('Вкладка активирована.');
			},
			world: 'MAIN',
		});
		console.log('Вкладка успешно активирована.');
	} catch (error) {
		console.error('Ошибка при активации вкладки:', error);
	}
}

// Внедрение основного скрипта
async function injectScript(mockPath, mockData, tabId) {
	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			func: overrideFetch,
			args: [mockPath, mockData, isActive],
			world: 'MAIN',
		});
		console.log('Скрипт успешно внедрен на вкладку:', tabId);
	} catch (error) {
		console.error('Ошибка при внедрении скрипта:', error);
	}
}

// Функция для восстановления оригинального fetch
async function restoreOriginalFetch() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab) {
			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				func: restoreFetch,
				world: 'MAIN',
			});
			console.log('Оригинальный fetch восстановлен.');
		} else {
			console.error('Активная вкладка не найдена.');
		}
	} catch (error) {
		console.error('Ошибка при восстановлении оригинального fetch:', error);
	}
}

// Функция для переопределения fetch
function overrideFetch(mockPath, mockData, isActive) {
	console.log('Перехват fetch-запросов активирован.');
	console.log('Данные из хранилища:', { mockPath, mockData, isActive });

	// Сохраняем оригинальный fetch в глобальной области видимости
	if (!window.originalFetch) {
		window.originalFetch = window.fetch;
	}

	window.fetch = async (input, init) => {
		const url = typeof input === 'string' ? input : input.url;
		console.log('Обнаружен fetch-запрос:', url);

		if (isActive && mockPath && url.includes(mockPath)) {
			console.log('Перехвачен запрос:', url);
			console.log('Возвращаем mock-данные:', mockData);
			return new Response(mockData, {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		console.log('Запрос не перехвачен, выполняется оригинальный fetch.');
		return window.originalFetch(input, init);
	};

	console.log(
		'window.fetch переопределен:',
		window.fetch !== window.originalFetch
	);
}

// Функция для восстановления оригинального fetch
function restoreFetch() {
	if (window.originalFetch) {
		window.fetch = window.originalFetch;
		console.log('Оригинальный fetch восстановлен.');
	} else {
		console.log('Оригинальный fetch не найден.');
	}
}
