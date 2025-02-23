console.log('Content script загружен.');

// Чтение данных из хранилища
chrome.storage.local.get(['path', 'data', 'isActive'], (result) => {
	const { path: mockPath, data: mockData, isActive } = result;
	console.log('Данные из хранилища:', { mockPath, mockData, isActive });

	if (isActive && typeof window !== 'undefined') {
		console.log('Перехват fetch-запросов активирован.');

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
	} else {
		console.log('Перехват fetch-запросов деактивирован.');
	}
});
