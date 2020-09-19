/* global requestAnimationFrame, document */
import { Required } from "Object/_api";
import * as PIXI from "pixi.js";
import * as particles from "pixi-particles";
import colors from "~colors";
// @ts-ignore
import tiles from "./assets/tiles/*.png"; // eslint-disable-line import/no-unresolved
import { MAP_HEIGHT, MAP_WIDTH, PLAYER_ID, TILE_SIZE } from "./constants";
import { Display, Entity, Pos } from "./types";
import { arePositionsEqual } from "./utils/geometry";

export const loadPromise = new Promise((resolve) => {
  PIXI.Loader.shared
    .add(
      Object.entries(tiles as Record<string, string>).map(([name, file]) => ({
        name,
        url: file.startsWith("/") ? `.${file}` : file,
      })),
    )
    .load(resolve);
});

PIXI.autoDetectRenderer().destroy();

export const app = new PIXI.Application({
  width: MAP_WIDTH * TILE_SIZE,
  height: MAP_HEIGHT * TILE_SIZE,
  backgroundColor: parseInt(colors.background.substr(1), 16),
  antialias: false,
  // roundPixels: true,
});

const emitters: Record<string, particles.Emitter> = {};
export function addSmoke(pos: Pos, offset: Pos) {
  loadPromise.then(() => {
    const key = `${pos.x},${pos.y},${offset.x},${offset.y}`;
    if (emitters[key]) {
      emitters[key].spawnChance = 1;
      return;
    }
    const texture = PIXI.Texture.WHITE;
    const emitter = new particles.Emitter(app.stage, [texture], {
      alpha: {
        start: 0.5,
        end: 0.0,
      },
      scale: {
        start: 1 / 8,
        end: 3 / 4,
        minimumScaleMultiplier: 1,
      },
      color: {
        start: colors.ground,
        end: colors.ground,
      },
      speed: {
        start: 5,
        end: 3,
        minimumSpeedMultiplier: 1,
      },
      acceleration: {
        x: 1,
        y: 0,
      },
      maxSpeed: 0,
      startRotation: {
        min: 270,
        max: 300,
      },
      noRotation: true,
      rotationSpeed: {
        min: 0,
        max: 0,
      },
      lifetime: {
        min: 3,
        max: 6,
      },
      blendMode: "normal",
      frequency: 0.25,
      emitterLifetime: -1,
      maxParticles: 1000,
      particlesPerWave: 3,
      pos: {
        x: pos.x * TILE_SIZE + offset.x,
        y: pos.y * TILE_SIZE + offset.y,
      },
      addAtBack: false,
      spawnType: "point",
    });
    emitters[key] = emitter;
  });
}

export function stopSmoke(pos: Pos, offset: Pos) {
  const key = `${pos.x},${pos.y},${offset.x},${offset.y}`;
  const emitter = emitters[key];
  if (emitter) {
    emitter.spawnChance = 0;
  }
}

export function removeSmoke(pos: Pos, offset: Pos) {
  const key = `${pos.x},${pos.y},${offset.x},${offset.y}`;
  const emitter = emitters[key];
  if (emitter) {
    emitter.destroy();
  }
  delete emitters[key];
}

loadPromise.then(() => {
  let lastTime = Date.now();
  const update = () => {
    requestAnimationFrame(update);
    const now = Date.now();
    Object.values(emitters).forEach((emitter) => {
      emitter.update((now - lastTime) / 1000);
    });
    lastTime = now;
    // app.render();
  };
  update();
});

let zoomedIn = false;
export function toggleZoom(pos: Pos) {
  if (zoomedIn) {
    zoomOut();
  } else {
    zoomTo(pos);
  }
}

export function zoomOut() {
  zoomedIn = false;
  app.stage.scale = new PIXI.Point(1, 1);
  app.stage.position = new PIXI.Point(0, 0);
}

export function zoomTo(pos: Pos) {
  const X_MIN = 0;
  const Y_MIN = 0;
  const X_MAX = MAP_WIDTH / 2;
  const Y_MAX = MAP_WIDTH / 2;
  const x = Math.max(Math.min(pos.x - MAP_WIDTH / 4, X_MAX), X_MIN);
  const y = Math.max(Math.min(pos.y - MAP_WIDTH / 4, Y_MAX), Y_MIN);
  zoomedIn = true;
  app.stage.scale = new PIXI.Point(2, 2);
  app.stage.position = new PIXI.Point(-x * TILE_SIZE * 2, -y * TILE_SIZE * 2);
}

export function getPosFromMouse(mouseX: number, mouseY: number): Pos {
  const canvas = document.getElementById("map") as HTMLCanvasElement;
  const scaleX = (MAP_WIDTH * TILE_SIZE) / canvas.clientWidth;
  const scaleY = (MAP_HEIGHT * TILE_SIZE) / canvas.clientHeight;
  const scaledMouseX = mouseX * scaleX;
  const scaledMouseY = mouseY * scaleY;
  if (!zoomedIn) {
    return {
      x: Math.floor(scaledMouseX / TILE_SIZE),
      y: Math.floor(scaledMouseY / TILE_SIZE),
    };
  } else {
    const offsetX = Math.floor(scaledMouseX / TILE_SIZE / 2);
    const offsetY = Math.floor(scaledMouseY / TILE_SIZE / 2);
    const stageX = app.stage.position.x / TILE_SIZE / -2;
    const stageY = app.stage.position.y / TILE_SIZE / -2;
    return {
      x: stageX + offsetX,
      y: stageY + offsetY,
    };
  }
}

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const renderEntities: {
  [id: string]: {
    displayComp: Display;
    pos: Pos;
    sprite?: PIXI.Sprite;
    background?: PIXI.Graphics;
  };
} = {};

const layers: {
  [priority: number]: PIXI.Container;
} = {};
function getLayer(priority: number) {
  if (layers[priority]) {
    return layers[priority];
  }
  const layer = new PIXI.Container();
  layer.name = priority.toString();
  layers[priority] = layer;
  app.stage.addChild(layer);
  app.stage.children.sort((a, b) => {
    const aPriority = parseFloat(a.name || "0") || 0;
    const bPriority = parseFloat(b.name || "0") || 0;
    return aPriority - bPriority;
  });
  return layer;
}

export function addRenderEntity(entity: Required<Entity, "display" | "pos">) {
  const { pos, display } = entity;
  renderEntities[entity.id] = {
    displayComp: { ...display },
    pos: { ...pos },
  };

  if (display.hasBackground) {
    const background = new PIXI.Graphics();
    background.beginFill(app.renderer.backgroundColor);
    background.lineStyle(0);
    background.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
    background.endFill();
    background.position = new PIXI.Point(pos.x * TILE_SIZE, pos.y * TILE_SIZE);

    renderEntities[entity.id].background = background;
    getLayer(display.priority).addChild(background);
  }

  if (display.tile) {
    const sprite = createSprite(pos, display);
    renderEntities[entity.id].sprite = sprite;
    getLayer(display.priority).addChild(sprite);
  }
}

function createSprite(pos: Pos, display: Display) {
  let sprite: PIXI.Sprite | PIXI.AnimatedSprite;
  if (typeof display.tile === "string") {
    sprite = new PIXI.Sprite(
      PIXI.utils.TextureCache[display.tile || "unknown"],
    );
  } else {
    sprite = new PIXI.AnimatedSprite(
      display.tile.map((tile) => PIXI.utils.TextureCache[tile || "unknown"]),
    );
    (sprite as PIXI.AnimatedSprite).animationSpeed = display.speed || 0.2;
    (sprite as PIXI.AnimatedSprite).play();
  }
  sprite.angle = display.rotation || 0;
  setSpritePosition(sprite, pos, display);
  sprite.width = TILE_SIZE;
  sprite.height = TILE_SIZE;
  sprite.tint = parseInt((display.color || "#FFFFFF").substr(1), 16);

  return sprite;
}

export function playAnimation(entityId: string) {
  const renderEntity = renderEntities[entityId];
  if (
    renderEntity &&
    renderEntity.sprite &&
    renderEntity.sprite instanceof PIXI.AnimatedSprite
  ) {
    renderEntity.sprite.play();
  }
}

export function stopAnimation(entityId: string) {
  const renderEntity = renderEntities[entityId];
  if (
    renderEntity &&
    renderEntity.sprite &&
    renderEntity.sprite instanceof PIXI.AnimatedSprite
  ) {
    renderEntity.sprite.stop();
  }
}

function setSpritePosition(sprite: PIXI.Sprite, pos: Pos, display: Display) {
  let { x, y } = pos;
  switch (display.rotation) {
    case 90:
      x += 1;
      break;
    case 180:
      x += 1;
      y += 1;
      break;
    case 270:
      y += 1;
      break;
    default:
      break;
  }
  sprite.position.set(x * TILE_SIZE, y * TILE_SIZE);
}

export function removeRenderEntity(entityId: string) {
  const renderEntity = renderEntities[entityId];
  if (renderEntity) {
    delete renderEntities[entityId];
    if (renderEntity.background) {
      renderEntity.background.parent.removeChild(renderEntity.background);
    }
    if (renderEntity.sprite) {
      renderEntity.sprite.parent.removeChild(renderEntity.sprite);
    }
  }
}

export function setBackgroundColor(color: string) {
  app.renderer.backgroundColor = parseInt(color.substr(1), 16);
  for (const [id, renderEntity] of Object.entries(renderEntities)) {
    reAddRenderEntity({
      id,
      display: renderEntity.displayComp,
      pos: renderEntity.pos,
      template: "" as TemplateName,
    });
  }
}

export function clearRenderer() {
  for (const id of Object.keys(renderEntities)) {
    removeRenderEntity(id);
  }
  for (const [key, emitter] of Object.entries(emitters)) {
    emitter.destroy();
    delete emitters[key];
  }
}

export function updateRenderEntity(
  entity: Required<Entity, "display" | "pos">,
) {
  const renderEntity = renderEntities[entity.id];
  if (renderEntity) {
    if (!arePositionsEqual(renderEntity.pos, entity.pos)) {
      renderEntity.pos = entity.pos;
      if (renderEntity.sprite) {
        setSpritePosition(
          renderEntity.sprite,
          renderEntity.pos,
          renderEntity.displayComp,
        );
      }
      if (renderEntity.background) {
        renderEntity.background.position.set(
          entity.pos.x * TILE_SIZE,
          entity.pos.y * TILE_SIZE,
        );
      }
      if (entity.id === PLAYER_ID && zoomedIn) {
        zoomTo(entity.pos);
      }
    }

    if (
      renderEntity.displayComp.tile !== entity.display.tile ||
      renderEntity.displayComp.color !== entity.display.color ||
      renderEntity.displayComp.priority !== entity.display.priority ||
      renderEntity.displayComp.rotation !== entity.display.rotation ||
      renderEntity.displayComp.hasBackground !== entity.display.hasBackground
    ) {
      reAddRenderEntity(entity);
    }
  }
}

export function reAddRenderEntity(entity: Required<Entity, "display" | "pos">) {
  const renderEntity = renderEntities[entity.id];
  const isPlaying =
    renderEntity && renderEntity.sprite instanceof PIXI.AnimatedSprite
      ? renderEntity.sprite.playing
      : false;
  removeRenderEntity(entity.id);
  addRenderEntity(entity);
  if (renderEntity && renderEntity.sprite instanceof PIXI.AnimatedSprite) {
    if (isPlaying) {
      playAnimation(entity.id);
    } else {
      stopAnimation(entity.id);
    }
  }
}
