import Phaser from "phaser";

const config = {
  // WebGL (Web graphics library) -  js api for rendering 2D and 3D graphics
  type: Phaser.AUTO, // Phaser will automatically decide which renderer to use (either WebGL or Canvas)
  width: 800,
  height: 600,
  physics: {
    // Arcade physics plugin, manages physics simulation
    default: "arcade", // This tells Phaser to use the Arcade Physics engine for any physics calculations in the game
    arcade: {
      debug: true,
      // gravity: { y: 400 }, // will set gravity to all object in this scene
    },
  },
  scene: {
    // specify function that will be executed, when loaded application
    // init,      // Called before preload, used for initializing data
    preload, // Loads assets before the scene starts
    create, // Sets up game objects, runs once after preload
    update, // Runs continuously, used for game logic and animations
    // render,    // Optional, used for custom rendering
    // shutdown,  // Called before transitioning to another scene
    // destroy,   // Cleanup before scene is removed completely
  },
};

// Loading assets, such as images, music, animations ...
// this - refer to Scene object witch contains functions and properties we can use

const VELOCITY = 200;
const PIPES_TO_RENDER = 40;

let bird = null;

let pipeHorizontalDistance = 400;

const pipeDistanceRange = [150, 250];

const initialPosition = { x: config.width / 10, y: config.height / 2 };
const flapVelocity = 250;

function preload() {
  // this context - scene
  this.load.image("sky", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
  this.load.image("pipe", "assets/pipe.png");
}

function create() {
  // --------------------------------------------------
  // <- BASICS OF PHASER CREATE->
  // 3 args: x / y / key_of_the_image
  // this.add.image(0, 0, "sky"); // if 0,0 it will set middle of a image in 0,0 coordinates scene point

  this.add.image(0, 0, "sky").setOrigin(0, 0); // .setOrigin(0, 0) changes the origin to the top-left corner of the image.

  // Creates a basic sprite (a game object): *Mainly used for static images or objects that are manually moved*
  // bird = this.add
  //   .sprite(config.width / 10, config.height / 2, "bird") *coordinates: middle of the height, 1/10 width
  //   .setOrigin(0); // sprites are used for animated objects.

  // Creates a sprite with physics: *Used for dynamic objects like a jumping character,*
  bird = this.physics.add
    .sprite(config.width / 10, config.height / 2, "bird")
    .setOrigin(0); // sprites are used for animated objects.

  bird.body.gravity.y = 400; // object will fall faster for 200px per sec (falling speed increases over time)

  // bird.body.velocity.y = 200; // Velocity is a fixed speed (200px fixed speed)

  // <- EXAMPLE OF MOVING Y OBJECT FORTH AND BACK->
  // bird.body.velocity.x = VELOCITY;

  // --------------------------------------------------
  // Adding Pipe

  for (let i = 0; i < PIPES_TO_RENDER; i++) {
    const upperPipe = this.physics.add.sprite(0, 0, "pipe").setOrigin(0, 1);
    const lowerPipe = this.physics.add.sprite(0, 0, "pipe").setOrigin(0, 0);

    placePipe(upperPipe, lowerPipe);
  }

  // event of pressing any button
  this.input.on("pointerdown", flat);

  this.input.keyboard.on("keydown-SPACE", flat);
  this.input.keyboard.on("keydown-R", restartBirdPosition);
}

// executed typically 60 times per second
function update(time, delta) {
  // delta - time from the last frame
  // --------------------------------------------------
  // if bird position x >= width of canvas, go back to the left
  // if x is <= 0 then move back to the right

  // <- EXAMPLE OF MOVING Y OBJECT FORTH AND BACK->
  //  ----------- bird.x of bird.body.x or bird.body.position.x
  // if (bird.body.position.x >= config.width - bird.width) {
  //   bird.body.velocity.x = -VELOCITY;
  // } else if (bird.body.position.x <= 0) {
  //   bird.body.velocity.x = VELOCITY;
  // }
  // --------------------------------------------------
  // if bird Y position is small then 0 or greater than height of the canvas
  if (bird.body.position.y > config.height || bird.y < 0) {
    restartBirdPosition();
  }
}

function placePipe(uPipe, lPipe) {
  let pipeVerticalDistance = Phaser.Math.Between(...pipeDistanceRange);
  let pipeVerticalPosition = Phaser.Math.Between(
    20,
    config.height - 20 - pipeVerticalDistance
  );

  uPipe.x = pipeHorizontalDistance;
  uPipe.y = pipeVerticalPosition;

  lPipe.x = uPipe.x;
  lPipe.y = uPipe.y + pipeVerticalDistance;

  lPipe.body.velocity.x = -200;
  uPipe.body.velocity.x = -200;

  pipeHorizontalDistance += 270;
}

function restartBirdPosition() {
  bird.x = initialPosition.x;
  bird.y = initialPosition.y;
  bird.body.velocity.y = 0;
}

function flat() {
  bird.body.velocity.y = -flapVelocity;
}

// Initialize instance for creating Game by config settings. "Scene"
new Phaser.Game(config);
