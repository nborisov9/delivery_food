const body = document.querySelector('body')

// убирает скролл 
window.disableScroll = () => {
	body.style.cssText = `
		position: relative;
		overflow: hidden;
		height: 100vh;
	`
}

// добавляет скролл
window.enableScroll = () => {
	body.style.cssText = ``
}