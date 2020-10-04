import Phaser from "phaser";
import config from "./config/config.js";
import BootScene from "./scenes/BootScene";
import PreloaderScene from "./scenes/PreloaderScene";
import TitleScene from "./scenes/TitleScene";
import GameScene from "./scenes/GameScene";
import UIScene from "./scenes/UIScene";

const canvas = document.querySelector("canvas");

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add("Boot", BootScene);
    this.scene.add("Preloader", PreloaderScene);
    this.scene.add("Title", TitleScene);
    this.scene.add("Game", GameScene);
    this.scene.add("UI", UIScene);
    this.scene.start("Boot");
  }
}

window.onload = function() {
  window.game = new Game();
  resize();
  window.addEventListener("resize", resize, false);
}

function resize() {
  var canvas = document.querySelector("canvas");
  var windowWidth = window.innerWidth;
  var windowHeight = window.innerHeight;
  var windowRatio = windowWidth / windowHeight;
  var gameRatio = config.width / config.height;
  //console.log(windowRatio, gameRatio);
  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + "px";
    canvas.style.height = (windowWidth / gameRatio) + "px";
  } else {
    canvas.style.width = (windowHeight * gameRatio) + "px";
    canvas.style.height = windowHeight + "px";
  }
}