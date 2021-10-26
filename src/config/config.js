import { Physics } from "phaser";

export default {
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      parent: "phaser-example",
      width: 640,
      height: 512,
    },
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
        gravity: { y:0 }
      }
    },
    audio: {
      disableWebAudio: true
    }
  };