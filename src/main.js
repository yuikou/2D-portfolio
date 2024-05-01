import { scaleFactor } from "./constants";
import { k } from "./kaboomCtx";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 780,
    "walk-down": { from: 780, to: 781, loop: true, speed: 8 },
    "idle-side": 782,
    "walk-side": { from: 782, to: 783, loop: true, speed: 8 },
    "idle-up": 819,
    "walk-up": { from: 819, to: 820, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#311047"));

//login for your scene
k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  //load the completed map data (will not run the rest of the other code until done)and convert it into json format
  const layers = mapData.layers;

  //game objects(make the array of components)
  const map = k.make([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);
  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10), //hit box
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 300,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }), //walls
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            //TODO: display dialogue here
          });
        }
      }
    }
  }
});

//default scene
k.go("main");
