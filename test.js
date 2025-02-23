document.getElementById('fetchButton').addEventListener('click', () => {
	fetch('https://jsonplaceholder.typicode.com/posts')
		.then((response) => response.json())
		.then((data) => console.log('Результат fetch-запроса:', data))
		.catch((error) => console.error('Ошибка fetch-запроса:', error));
});
