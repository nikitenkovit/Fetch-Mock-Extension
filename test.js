// Обработчик для первой кнопки (запрос на /posts)
document.getElementById('fetchButton').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/posts')
		.then((response) => response.json())
		.then((data) => console.log('Результат fetch-запроса (posts):', data))
		.catch((error) => console.error('Ошибка fetch-запроса (posts):', error));
});

// Обработчик для второй кнопки (запрос на /comments)
document.getElementById('fetchButton2').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/comments')
		.then((response) => response.json())
		.then((data) => console.log('Результат fetch-запроса (comments):', data))
		.catch((error) => console.error('Ошибка fetch-запроса (comments):', error));
});
