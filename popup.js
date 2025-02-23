console.log('Popup script загружен.');

// Загрузка данных при открытии popup
chrome.storage.local.get(['path', 'data', 'isActive'], (result) => {
	document.getElementById('path').value = result.path || '';
	document.getElementById('data').value = result.data || '';
	document.getElementById('isActive').checked = result.isActive || false;
	console.log('Данные загружены в popup:', result);
});

// Переключение состояния радиокнопки
document.getElementById('isActive').addEventListener('change', (event) => {
	const isActive = event.target.checked; // Используем текущее значение радиокнопки
	const path = document.getElementById('path').value;
	const data = document.getElementById('data').value;

	console.log('Состояние радиокнопки изменено:', isActive);

	// Сохраняем данные в хранилище
	chrome.storage.local.set({ path, data, isActive }, () => {
		console.log('Данные сохранены в хранилище:', { path, data, isActive });
		chrome.runtime.sendMessage({
			action: isActive ? 'activate' : 'deactivate',
			path,
			data,
		});
	});
});

// Синхронизация состояния радиокнопки при изменении хранилища
chrome.storage.onChanged.addListener((changes, area) => {
	if (area === 'local' && changes.isActive) {
		const isActive = changes.isActive.newValue;
		console.log('Состояние isActive изменено в хранилище:', isActive);
		document.getElementById('isActive').checked = isActive;
	}
});
