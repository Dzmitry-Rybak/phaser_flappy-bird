import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene"); // With this name, we can switch between scenes
  }

  //-------------------- Loading assets, such as images, music, animations --------------------
  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.spritesheet("bird", "assets/birdSprite.png", {
      frameWidth: 16, // split image by 16px X
      frameHeight: 16, // split image by 16px Y
    }); // loading images witch contains with mane small pice
    this.load.image("pipe", "assets/pipe.png");
    this.load.image("pause", "assets/pause.png");
    this.load.image("back", "assets/back.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}

export default PreloadScene;
