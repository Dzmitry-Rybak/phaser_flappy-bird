import Phaser from "phaser";

import PlayScene from "./scenes/PlayScene";
import MenuScene from "./scenes/MenuScene";
import PreloadScene from "./scenes/PreloadScene";
import ScoreScene from "./scenes/ScoreScene";
import PauseScene from "./scenes/PauseScene";

const WIDTH = 400;
const HEIGHT = 600;
const BIRD_POSITION = { x: WIDTH / 10, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
};

const Scenes = [PreloadScene, MenuScene, PauseScene, ScoreScene, PlayScene];

const createScene = (Scene) => new Scene(SHARED_CONFIG);

const initScenes = () => Scenes.map(createScene);

const config = {
  // WebGL (Web graphics library) -  js api for rendering 2D and 3D graphics
  type: Phaser.AUTO, // Phaser will automatically decide which renderer to use (either WebGL or Canvas)
  ...SHARED_CONFIG,
  pixelArt: true,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: "arcade", // This tells Phaser to use the Arcade Physics engine for any physics calculations in the game
    arcade: {
      debug: true,
      // gravity: { y: 400 }, // will set gravity to all object in this scene
    },
  },
  scene: initScenes(),
};

new Phaser.Game(config); // Initialize instance for creating Game by config settings. "Scene"
