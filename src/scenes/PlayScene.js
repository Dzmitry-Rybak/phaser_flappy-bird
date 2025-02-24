import Phaser from "phaser";

// --------------- SPECIFY FUNCTION TO BE EXECUTED WHILE LOADING ---------------
// init,      // Called before preload, used for initializing data
// preload,   // Loads assets before the scene starts
// create,    // Sets up game objects, runs once after preload
// update,    // Runs continuously, used for game logic and animations
// render,    // Optional, used for custom rendering
// shutdown,  // Called before transitioning to another scene
// destroy,   // Cleanup before scene is removed completely

const PIPES_TO_RENDER = 4;

class PlayScene extends Phaser.Scene {
  constructor(config) {
    super("PlayScene");
    this.config = config;
    this.bird = null;
    this.pipes = null;

    this.pipeHorizontalDistance = 0;
    this.pipeDistanceRange = [150, 250];
    this.pipeHorizontalDistanceRange = [350, 400];
    this.flapVelocity = 250;
  }

  //-------------------- Loading assets, such as images, music, animations --------------------
  preload() {
    // this = scene
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
    this.load.image("pipe", "assets/pipe.png");
  }

  create() {
    // -------------------- BASICS OF PHASER CREATE ------------------------------

    // this.add.image - 3 args: x , y , key_of_the_image
    // this.add.image(0, 0, "sky"); // if 0,0 it will set middle of a image in 0,0 coordinates scene point

    this.add.image(0, 0, "sky").setOrigin(0, 0); // .setOrigin(0, 0) changes the origin to the top-left corner of the image.

    // -------------------- Creates a basic sprite ------------------------------
    // *Mainly used for static images or objects that are manually moved*

    // bird = this.add
    //   .sprite(config.width / 10, config.height / 2, "bird") *coordinates: middle of the height, 1/10 width
    //   .setOrigin(0); // sprites are used for animated objects.

    // -------------------- Creates a sprite with physics ------------------------------
    // *Used for dynamic objects like a jumping character,*
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, "bird") // sprites are used for animated objects.
      .setOrigin(0);

    this.bird.body.gravity.y = 400; // object will fall faster for 200px per sec (falling speed increases over time)

    // bird.body.velocity.y = 200; // Velocity is a fixed speed (200px fixed speed)

    // <- EXAMPLE OF MOVING Y OBJECT FORTH AND BACK->
    // bird.body.velocity.x = VELOCITY;

    // --------------------- ADDING PIPE -----------------------------

    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, "pipe").setOrigin(0, 1); // create - the same as add.spite()
      const lowerPipe = this.pipes.create(0, 0, "pipe").setOrigin(0, 0);
      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);

    // --------------------- EVENT OF PRESSING BUTTON ---------------------
    this.input.on("pointerdown", this.flat, this);
    this.input.keyboard.on("keydown-SPACE", this.flat, this);
    this.input.keyboard.on("keydown-R", this.restartBirdPosition, this);
  }

  // --------------------- Executed 60 times per second ---------------------
  update() {
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
    if (this.bird.body.position.y > this.config.height || this.bird.y < 0) {
      this.restartBirdPosition();
    }

    this.recyclePipes();
  }

  placePipe(uPipe, lPipe) {
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(...this.pipeDistanceRange);
    const pipeVerticalPosition = Phaser.Math.Between(
      20,
      this.config.height - 20 - pipeVerticalDistance
    );
    const pipeHorizontalDistance = Phaser.Math.Between(
      ...this.pipeHorizontalDistanceRange
    );

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }

  restartBirdPosition() {
    this.bird.x = this.config.startPosition.x;
    this.bird.y = this.config.startPosition.y;
    this.bird.body.velocity.y = 0;
  }

  flat() {
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  recyclePipes() {
    let tempPipes = [];

    this.pipes.getChildren().forEach((pipe) => {
      // getBounds().right - get right edge of the pipe
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          tempPipes = [];
        }
      }
    });
  }

  getRightMostPipe() {
    let rightMostX = 0;

    // getChildren - return a array with elements in group
    this.pipes.getChildren().forEach(function (pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
  }
}

export default PlayScene;
