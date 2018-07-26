//UI controller

var UiController = {};

UiController.init = function() {
	UiController.title = document.getElementById("title");
	UiController.menu = document.getElementById("menu");
	UiController.aboutBox = document.getElementById("aboutBox");
	UiController.pauseMenu = document.getElementById("pauseMenu");
	UiController.winBox = document.getElementById("winBox");
	UiController.difficultySelect = document.getElementById("difficultySelect");
	UiController.skinSelect = document.getElementById("skinSelect");
	UiController.playButton = document.getElementById("playButton");
	UiController.aboutButton = document.getElementById("aboutButton");
	UiController.closeAboutButton = document.getElementById("closeAboutButton");
	UiController.continueButton = document.getElementById("continueButton");
	UiController.pauseMenuReturnToMenuButton = document.getElementById("pauseMenuReturnToMenuButton");
	UiController.playAgainButton = document.getElementById("playAgainButton");
	UiController.winBoxReturnToMenuButton = document.getElementById("winBoxReturnToMenuButton");
	UiController.lightSheet = document.getElementById("lightSheet");
	UiController.darkSheet = document.getElementById("darkSheet");
	UiController.cyberSheet = document.getElementById("cyberSheet");

	UiController.skinSelect.onchange = UiController.updateSkin;
	UiController.aboutButton.onclick = function() {
		UiController.hideAll();
		UiController.showAboutBox();
	};

	UiController.closeAboutButton.onclick = function() {
		UiController.hideAll();
		UiController.showMenu();
	};
};

UiController.showMenu = function() {
	UiController.showElement(UiController.title);
	UiController.showElement(UiController.menu);
};

UiController.hideMenu = function() {
	UiController.hideElement(UiController.title);
	UiController.hideElement(UiController.menu);
};

UiController.showAboutBox = function() {
	UiController.showElement(UiController.aboutBox);
};

UiController.hideAboutBox = function() {
	UiController.hideElement(UiController.aboutBox);
};

UiController.showPauseMenu = function() {
	UiController.showElement(UiController.pauseMenu);
};

UiController.hidePauseMenu = function() {
	UiController.hideElement(UiController.pauseMenu);
};

UiController.showWinBox = function() {
	UiController.showElement(UiController.winBox);
};

UiController.hideWinBox = function() {
	UiController.hideElement(UiController.winBox);
};

UiController.hideAll = function() {
	UiController.hideMenu();
	UiController.hideAboutBox();
	UiController.hidePauseMenu();
	UiController.hideWinBox();
};

UiController.updateSkin = function() {
	var skinSelection = UiController.getSkinSelection();
	switch (skinSelection) {
		case "light":
			UiController.enableSheet(UiController.lightSheet);
			UiController.disableSheet(UiController.darkSheet);
			UiController.disableSheet(UiController.cyberSheet);
			break;
		case "dark":
			UiController.enableSheet(UiController.darkSheet);
			UiController.disableSheet(UiController.lightSheet);
			UiController.disableSheet(UiController.cyberSheet);
			break;
		case "cyber":
			UiController.enableSheet(UiController.cyberSheet);
			UiController.disableSheet(UiController.lightSheet);
			UiController.disableSheet(UiController.darkSheet);
	}
	renderer.setSkin(skinSelection);
};

UiController.getDifficultySelection = function() {
	return UiController.difficultySelect.value;
};

UiController.getSkinSelection = function() {
	return UiController.skinSelect.value;
};

UiController.disableSheet = function(node) {
	node.rel = "stylesheet alternate";
};

UiController.enableSheet = function(node) {
	node.rel = "stylesheet";
};

UiController.hideElement = function(element) {
	element.style.display = "none";
};

UiController.showElement = function(element) {
	element.style.display = "block";
}

UiController.init();