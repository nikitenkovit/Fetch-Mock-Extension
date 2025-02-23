console.log('Popup script загружен.');

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
