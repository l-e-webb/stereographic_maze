//UI controller

var UiController = {};

UiController.init = function() {
	UiController.title = document.getElementById("title");
	UiController.menu = document.getElementById("menu");
	UiController.aboutWindow = document.getElementById("aboutWindow");
	UiController.difficultySelect = document.getElementById("difficultySelect");
	UiController.skinSelect = document.getElementById("skinSelect");
	UiController.playButton = document.getElementById("playButton");
	UiController.aboutButton = document.getElementById("aboutButton");
	UiController.closeAboutButton = document.getElementById("closeAboutButton");
	UiController.lightSheet = document.getElementById("lightSheet");
	UiController.darkSheet = document.getElementById("darkSheet");
	UiController.cyberSheet = document.getElementById("cyberSheet");

	UiController.skinSelect.onchange = UiController.updateSkin;
	UiController.aboutButton.onclick = function() {
		UiController.hideMenu();
		UiController.showAboutWindow();
	};

	UiController.closeAboutButton.onclick = function() {
		UiController.hideAboutWindow();
		UiController.showMenu();
	};

	UiController.hideAboutWindow();
};

UiController.showMenu = function() {
	UiController.title.style.display = "block";
	UiController.menu.style.display = "block";
};

UiController.hideMenu = function() {
	UiController.title.style.display = "none";
	UiController.menu.style.display = "none";
};

UiController.showAboutWindow = function() {
	UiController.aboutWindow.style.display = "block";
};

UiController.hideAboutWindow = function() {
	UiController.aboutWindow.style.display = "none";
}

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

UiController.setPlayButtonListener = function(listener) {
	UiController.playButton.onclick = listener;
};

UiController.disableSheet = function(node) {
	node.rel = "stylesheet alternate";
};

UiController.enableSheet = function(node) {
	node.rel = "stylesheet";
};

UiController.init();