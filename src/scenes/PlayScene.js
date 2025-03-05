import BaseScene from "./BaseScene";

// --------------- SPECIFY FUNCTION TO BE EXECUTED WHILE LOADING ---------------
// init,      // Called before preload, used for initializing data
// preload,   // Loads assets before the scene starts
// create,    // Sets up game objects, runs once after preload
// update,    // Runs continuously, used for game logic and animations
// render,    // Optional, used for custom rendering
// shutdown,  // Called before transitioning to another scene
// destroy,   // Cleanup before scene is removed completely

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", { ...config, canGoBack: true }); // With this name, we can switch between scenes

    this.bird = null;
    this.pipes = null;
    this.pause = null;
    this.isPaused = false;

    this.pipeHorizontalDistance = 0;
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = "";

    this.bestScore = 0;
    this.bestScoreText = "";

    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        pipeHorizontalDistanceRange: [480, 500],
        pipeVerticalDistanceRange: [340, 380],
      },
      normal: {
        pipeHorizontalDistanceRange: [380, 400],
        pipeVerticalDistanceRange: [340, 380],
      },
      hard: {
        pipeHorizontalDistanceRange: [360, 380],
        pipeVerticalDistanceRange: [340, 380],
      },
    };
  }

  create() {
    super.create(); // call create method from BaseScene class
    this.currentDifficulty = "easy";
    this.createBird();

    this.createPipes();

    this.createColliders();

    this.createScore();

    this.createBestScore();

    this.createPause();

    this.handleInputs();

    this.listenToEvents();

    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", { start: 8, end: 15 }),
      // 8fps, it will play animation consisting of 8 frames in 1 second

      // in case of frameRate 2 and sprite of 8 frames animations will play in 4 sec: 8 / 2 = 4
      frameRate: 8,
      repeat: -1, // repeat infinite loop
    });

    this.bird.play("fly");
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

  listenToEvents() {
    if (this.pauseEvent) {
      return;
    }
    // Event resume
    this.pauseEvent = this.events.on("resume", () => {
      this.initialTime = 3;
      this.countDownText = this.add
        .text(
          ...this.screenCenter,
          "Fly in: " + this.initialTime,
          this.fontOptions
        )
        .setOrigin(0.5, 0.5); // Centering the text
      this.timeEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    this.countDownText.setText("Fly in: " + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText("");
      this.physics.resume();
      this.timeEvent.remove();
    }
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
      .setScale(4)
      .setFlipX(true) // Flex image by X (180deg)
      .setOrigin(0);

    this.bird.setBodySize(this.bird.width, this.bird.height - 7);

    // bird.body.velocity.y = 200; // Velocity is a fixed speed (200px fixed speed)
    this.bird.body.gravity.y = 600; // object will fall faster for 200px per sec (falling speed increases over time)

    this.bird.setCollideWorldBounds(true); // Phaser enables collision between the game object and the edges of the game world.
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true) // disable to move this objects
        .setOrigin(0, 1) // create - the same as add.spite()
        .setScale(1, 3);
      const lowerPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 0)
        .setScale(1, 3);
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
    this.isPaused = false;
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setInteractive()
      .setScale(3)
      .setOrigin(1, 1);

    pauseButton.on("pointerdown", () => {
      this.isPaused = true;
      this.physics.pause();
      // scene.pause can kill current scene
      // scene.launch just pause scene
      this.scene.pause();
      this.scene.launch("PauseScene"); // it will stay in pause state
    });
  }

  handleInputs() {
    // --------------------- EVENT OF PRESSING BUTTON ---------------------
    this.input.on("pointerdown", this.flap, this);
    this.input.keyboard.on("keydown-SPACE", this.flap, this);
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
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();
    const pipeVerticalDistance = Phaser.Math.Between(
      ...difficulty.pipeVerticalDistanceRange
    );
    const pipeVerticalPosition = Phaser.Math.Between(
      200,
      this.config.height - 200 - pipeVerticalDistance
    );
    const pipeHorizontalDistance = Phaser.Math.Between(
      ...difficulty.pipeHorizontalDistanceRange
    );
    console.log("uPipe.y", uPipe.y);
    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
    console.log("lPipe.y", lPipe.y);
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
        this.scene.restart();
      },
      loop: false,
    });
  }

  flap() {
    if (this.isPaused) return;
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
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 5) {
      this.currentDifficulty = "normal";
    }

    if (this.score === 10) {
      this.currentDifficulty = "hard";
    }
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
      localStorage.setItem("bestScore", this.bestScore);
    }
  }
}

export default PlayScene;
