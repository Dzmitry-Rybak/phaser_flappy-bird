import Phaser from "phaser";

class BaseScene extends Phaser.Scene {
  constructor(key, config) {
    super(key); // With this name, we can switch between scenes

    this.config = config;
    this.fontSize = 34;
    this.lineHeight = 42;
    this.screenCenter = [config.width / 2, config.height / 2];
    this.fontOptions = { fontSize: `${this.fontSize}px`, fill: "#FFF" };
  }

  create() {
    this.add
      .image(0, 0, "sky")
      .setOrigin(0)
      .setDisplaySize(this.config.width, this.config.height);

    if (this.config.canGoBack) {
      const backButton = this.add
        .image(this.config.width - 50, this.config.height - 50, "back")
        .setInteractive()
        .setScale(2)
        .setOrigin(1)
        .setDepth(1);

      backButton.on("pointerup", () => {
        this.scene.start("MenuScene");
      });
    }
  }

  createMenu(menu, setupMenuEvents) {
    let lastMenuPositionY = 0;

    menu.forEach((menuItem) => {
      const menuPosition = [
        this.screenCenter[0],
        this.screenCenter[1] + lastMenuPositionY,
      ];
      menuItem.textGO = this.add
        .text(...menuPosition, menuItem.text, this.fontOptions)
        .setOrigin(0.5, 1);

      setupMenuEvents(menuItem);

      lastMenuPositionY += this.lineHeight;
    });
  }
}

export default BaseScene;
