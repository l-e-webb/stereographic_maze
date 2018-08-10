//UI controller

var UiController = {};

UiController.init = function() {
	UiController.title = document.getElementById("title");
	UiController.menu = document.getElementById("menu");
	UiController.aboutBox = document.getElementById("aboutBox");
	UiController.pauseMenu = document.getElementById("pauseMenu");
	UiController.winBox = document.getElementById("winBox");
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
	UiController.difficultyLeft = document.getElementById("difficultyLeft");
	UiController.difficultyRight = document.getElementById("difficultyRight");
	UiController.difficultySelect = document.getElementById("difficulty");
	UiController.skinLeft = document.getElementById("skinLeft");
	UiController.skinRight = document.getElementById("skinRight");
	UiController.skinSelect = document.getElementById("skin");

	UiController.aboutButton.onclick = function() {
		UiController.hideAll();
		UiController.showAboutBox();
	};

	UiController.closeAboutButton.onclick = function() {
		UiController.hideAll();
		UiController.showMenu();
	};

	UiController.difficultyLeft.onclick = function() {
		if (UiController.difficulty > 0) {
			UiController.difficulty--;
			UiController.updateUiMenu();
		}
	};

	UiController.difficultyRight.onclick = function() {
		if (UiController.difficulty < 2) {
			UiController.difficulty++;
			UiController.updateUiMenu();
		}
	};

	UiController.skinLeft.onclick = function() {
		if (UiController.skin > 0) {
			UiController.skin--;
			UiController.updateUiMenu();
		}
	};

	UiController.skinRight.onclick = function() {
		if (UiController.skin < 2) {
			UiController.skin++;
			UiController.updateUiMenu();
		}
	};

	UiController.skinSettings = ["Cyber", "Light", "Dark"];
	UiController.difficultySettings = ["Easy", "Medium", "Hard"];
	UiController.skin = 0;
	UiController.difficulty = 1;
	UiController.updateUiMenu();
};

UiController.updateUiMenu = function() {
	UiController.difficultySelect.innerHTML = UiController.difficultySettings[UiController.difficulty];
	UiController.skinSelect.innerHTML = UiController.skinSettings[UiController.skin];
	UiController.difficultyLeft.disabled = UiController.difficulty == 0;
	UiController.difficultyRight.disabled = UiController.difficulty == 2;
	UiController.skinLeft.disabled = UiController.skin == 0;
	UiController.skinRight.disabled = UiController.skin == 2;
	UiController.updateSkin();
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
	UiController.renderer.setSkin(skinSelection);
};

UiController.getDifficultySelection = function() {
	return UiController.difficultySettings[UiController.difficulty].toLowerCase();
};

UiController.getSkinSelection = function() {
	return UiController.skinSettings[UiController.skin].toLowerCase();
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
};