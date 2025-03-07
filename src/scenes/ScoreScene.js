import BaseScene from "./BaseScene";

class ScoreScene extends BaseScene {
  constructor(config) {
    super("ScoreScene", { ...config, canGoBack: true });
  }

  create() {
    super.create();

    const bestScore = localStorage.getItem("bestScore");

    this.add
      .text(...this.screenCenter, `Best score: ${bestScore || 0}`, {
        fontSize: "32px",
      })
      .setOrigin(0.5, 1);
  }
}

export default ScoreScene;
