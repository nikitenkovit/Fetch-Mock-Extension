console.log('Popup script загружен.');

// Загрузка данных при открытии popup
chrome.storage.local.get(['path', 'data', 'isActive'], (result) => {
	document.getElementById('path').value = result.path || '';
	document.getElementById('data').value = result.data || '';
	document.getElementById('isActive').checked = result.isActive || false;
	console.log('Данные загружены в popup:', result);
});

// Сохранение данных при нажатии на кнопку
document.getElementById('save').addEventListener('click', () => {
	const path = document.getElementById('path').value;
	const data = document.getElementById('data').value;
	const isActive = document.getElementById('isActive').checked;

	console.log('Сохранение данных:', { path, data, isActive });

	chrome.storage.local.set({ path, data, isActive }, () => {
		console.log('Данные сохранены в хранилище.');
		chrome.runtime.sendMessage({
			action: isActive ? 'activate' : 'deactivate',
			path,
			data,
		});
	});
});
