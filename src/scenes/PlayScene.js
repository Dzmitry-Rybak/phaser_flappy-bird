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
    super("PlayScene"); // With this name, we can switch between scenes

    this.config = config;
    this.bird = null;
    this.pipes = null;
    this.pause = null;

    this.pipeHorizontalDistance = 0;
    this.pipeDistanceRange = [150, 250];
    this.pipeHorizontalDistanceRange = [350, 400];
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = "";

    this.bestScore = 0;
    this.bestScoreText = "";
  }

  create() {
    this.createBG();

    this.createBird();

    this.createPipes();

    this.createColliders();

    this.createScore();

    this.createBestScore();

    this.createPause();

    this.handleInputs();
  }

  // --------------------- Executed 60 times per second ---------------------
  update() {
    // delta - time from the last frame

    //----------------- EXAMPLE OF MOVING Y OBJECT FORTH AND BACK -----------------
    // bird.x of bird.body.x or bird.body.position.x
    // if (bird.body.position.x >= config.width - bird.width) {
    //   bird.body.velocity.x = -VELOCITY;
    // } else if (bird.body.position.x <= 0) {
    //   bird.body.velocity.x = VELOCITY;
    // }

    this.checkGameStatus();

    this.recyclePipes();
  }

  createBG() {
    // this.add.image - 3 args: x , y , key_of_the_image
    // this.add.image(0, 0, "sky"); // if 0,0 it will set middle of a image in 0,0 coordinates scene point

    this.add.image(0, 0, "sky").setOrigin(0, 0); // .setOrigin(0, 0) changes the origin to the top-left corner of the image.
  }

  createBird() {
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

    this.bird.body.gravity.y = 600; // object will fall faster for 200px per sec (falling speed increases over time)

    this.bird.setCollideWorldBounds(true); // Phaser enables collision between the game object and the edges of the game world.

    // bird.body.velocity.y = 200; // Velocity is a fixed speed (200px fixed speed)
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true) // disable to move this objects
        .setOrigin(0, 1); // create - the same as add.spite()
      const lowerPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 0);
      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  // this.pipes.getChildren().forEach((pipe) => {
  //   // getBounds().right - get right edge of the pipe
  //   if (pipe.getBounds().right <= 0) {
  //     tempPipes.push(pipe);
  //     if (tempPipes.length === 2) {
  //       this.placePipe(...tempPipes);
  //       tempPipes = [];
  //     }
  //   }
  // });
  createScore() {
    this.score = 0;
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, {
      fontSize: "32px",
      fill: "#000",
    });
  }

  createBestScore() {
    this.bestScoreText = this.add.text(16, 50, `BestScore: ${this.bestScore}`, {
      fontSize: "20px",
      fill: "#000",
    });
  }

  createPause() {
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setInteractive()
      .setScale(3)
      .setOrigin(1, 1);

    pauseButton.on("pointerdown", () => {
      this.physics.pause();
      console.log(this.physics.pause());
    });
  }

  handleInputs() {
    // --------------------- EVENT OF PRESSING BUTTON ---------------------
    this.input.on("pointerdown", this.flat, this);
    this.input.keyboard.on("keydown-SPACE", this.flat, this);
    this.input.keyboard.on("keydown-R", this.gameOver, this);
  }

  checkGameStatus() {
    // if bird Y position is small then 0 or greater than height of the canvas
    if (
      this.bird.getBounds().bottom >= this.config.height ||
      this.bird.y <= 0
    ) {
      this.gameOver();
    }
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

  gameOver() {
    // --------------------- SET DEFAULT POSITION ---------------------
    // this.bird.x = this.config.startPosition.x;
    // this.bird.y = this.config.startPosition.y;
    // this.bird.body.velocity.y = 0;

    // --------------------- PAUSE AND RESTART GAME IN 1s ---------------------

    this.physics.pause();
    this.bird.setTint(0xee4824); // set color for object

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score = 0;
        // this.scene.restart();
      },
      loop: false,
    });
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
          this.increaseScore();
          this.placePipe(...tempPipes);
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

  // --------------------- INCREASE SCORE ---------------------
  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreText.setText(`BestScore: ${this.score}`);
    }
  }
}

export default PlayScene;
