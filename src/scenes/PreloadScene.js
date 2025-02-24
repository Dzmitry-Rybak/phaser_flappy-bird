import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene"); // With this name, we can switch between scenes
  }

  //-------------------- Loading assets, such as images, music, animations --------------------
  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
    this.load.image("pipe", "assets/pipe.png");
    this.load.image("pause", "assets/pause.png");
  }

  create() {
    this.scene.start("MenuScene");
  }
}

export default PreloadScene;
