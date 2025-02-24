import Phaser from "phaser";

import PlayScene from "./scenes/PlayScene";

const WIDTH = 800;
const HEIGHT = 600;
const BIRD_POSITION = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
};

const config = {
  // WebGL (Web graphics library) -  js api for rendering 2D and 3D graphics
  type: Phaser.AUTO, // Phaser will automatically decide which renderer to use (either WebGL or Canvas)
  ...SHARED_CONFIG,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: "arcade", // This tells Phaser to use the Arcade Physics engine for any physics calculations in the game
    arcade: {
      debug: true,
      // gravity: { y: 400 }, // will set gravity to all object in this scene
    },
  },
  scene: [new PlayScene(SHARED_CONFIG)],
};

// this - refer to Scene object witch contains functions and properties we can use

// Initialize instance for creating Game by config settings. "Scene"
new Phaser.Game(config);
