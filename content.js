console.log('Content script загружен.');

if (typeof window !== 'undefined') {
	const originalFetch = window.fetch;

	window.fetch = async (input, init) => {
		const url = typeof input === 'string' ? input : input.url;
		console.log('Обнаружен fetch-запрос:', url);

		// Проверяем, содержит ли URL часть, указанную в mockPath
		if (url.includes(mockPath)) {
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
}
