import WrappedState from "../types/WrappedState";
import { Entity } from "../types";
import { getPositionToDirection } from "../lib/geometry";
import { UP, RIGHT, DOWN, LEFT } from "../constants";
import { EffectId } from "../types/EffectId";
import { createEntityFromTemplate } from "../lib/entities";
import { TemplateName } from "../types/TemplateName";

export type Effect = (
  state: WrappedState,
  actor?: Entity,
  target?: Entity
) => void;

const effects: Record<EffectId, Effect> = {
  CLEAR_UI_ABSORBER_CHARGE: createClearEffect("UI_ABSORBER_CHARGE"),

  CLEAR_UI_OVERHEAT: createClearEffect("UI_OVERHEATING"),

  DESTROY: (state, actor, target) => {
    if (!target) return;
    state.act.destroy(target.id);
  },

  ON_COLONIST_DESTROYED: (state, actor, target) => {
    if (!target) return;
    state.act.reduceMorale({ amount: 1 });
    state.act.logEvent({ type: "COLONIST_DIED" });
    if (target.colonist && target.colonist.residence) {
      const residence = state.select.entityById(target.colonist.residence);
      if (residence && residence.housing) {
        state.act.updateEntity({
          id: residence.id,
          housing: {
            ...residence.housing,
            occupancy: residence.housing.occupancy - 1,
          },
        });
      }
    }
    if (target.colonist && target.colonist.employment) {
      const employment = state.select.entityById(target.colonist.employment);
      if (employment && employment.jobProvider) {
        state.act.updateEntity({
          id: employment.id,
          jobProvider: {
            ...employment.jobProvider,
            numberEmployed: employment.jobProvider.numberEmployed - 1,
          },
        });
      }
    }
  },

  ON_ROAD_BUILD: (state, actor, target) => {
    if (!target || !target.pos) return;
    state.act.roadUpdateTile(target.pos);
    state.act.roadUpdateTile(getPositionToDirection(target.pos, UP));
    state.act.roadUpdateTile(getPositionToDirection(target.pos, RIGHT));
    state.act.roadUpdateTile(getPositionToDirection(target.pos, DOWN));
    state.act.roadUpdateTile(getPositionToDirection(target.pos, LEFT));
  },

  SHIELD_DISCHARGE: (state, actor, target) => {
    if (!target) return;
    state.act.shieldDischarge(target.id);
  },

  SPAWN_PLAYER_CORPSE: createSpawnEffect("PLAYER_CORPSE"),
  SPAWN_BUILDING_WALL_CRACKED: createSpawnEffect("BUILDING_WALL_CRACKED"),
  SPAWN_BUILDING_WALL_CRUMBLING: createSpawnEffect("BUILDING_WALL_CRUMBLING"),
  SPAWN_ENEMY_DRONE: createSpawnEffect("ENEMY_DRONE"),
};

function createSpawnEffect(template: TemplateName): Effect {
  return function spawnEffect(state, actor, target) {
    let entityToSpawn = createEntityFromTemplate(template, {
      pos: target ? target.pos : undefined,
    });
    if (target && target.ai && entityToSpawn.ai) {
      entityToSpawn = {
        ...entityToSpawn,
        ai: {
          ...entityToSpawn.ai,
          plannedAction: target.ai.plannedAction,
          plannedActionDirection: target.ai.plannedActionDirection,
        },
      };
    }
    state.act.addEntity(entityToSpawn);
  };
}

function createClearEffect(template: TemplateName): Effect {
  return function clearEffect(state, actor, target) {
    if (!target || !target.pos) return;
    state.act.removeEntities(
      state.select
        .entitiesAtPosition(target.pos)
        .filter((e) => e.template === template)
        .map((e) => e.id)
    );
  };
}

export default effects;