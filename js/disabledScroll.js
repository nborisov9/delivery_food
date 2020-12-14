const body = document.querySelector('body');

window.disableScroll = () => {
  body.style.cssText = `
		position: relative;
		overflow: hidden;
		height: 100vh;
	`;
};

window.enableScroll = () => {
  body.style.cssText = ``;
};
