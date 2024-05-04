import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 780,
    "walk-down": { from: 780, to: 781, loop: true, speed: 9 },
    "idle-side": 782,
    "walk-side": { from: 782, to: 783, loop: true, speed: 9 },
    "idle-up": 819,
    "walk-up": { from: 819, to: 820, loop: true, speed: 9 },
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
  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);
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
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            ); //the code 'player.isInDialogue = false' allows player to move again
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.pos.x, player.pos.y + 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    //upper animation
    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() != "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    //down animation
    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() != "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    //right animation
    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    //left animation
    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }

    //stop the player after moving
    k.onMouseRelease(() => {
      if (player.direction === "down") {
        player.play("idle-down");
        return;
      }

      if (player.direction === "up") {
        player.play("idle-up");
        return;
      }

      player.play("idle-side");
    });
  });
});

//default scene
k.go("main");
