import { Required } from "ts-toolbelt/out/Object/Required";
import { createAction } from "typesafe-actions";
import { Entity } from "../../types";
import { getPosKey } from "../../lib/geometry";
import { registerHandler } from "../handleAction";
import WrappedState from "../../types/WrappedState";
import { retargetLaserOnReflectorChange } from "../../lib/lasers";

const addEntity = createAction("ADD_ENTITY")<Entity>();
export default addEntity;

function addEntityHandler(
  wrappedState: WrappedState,
  action: ReturnType<typeof addEntity>
): void {
  let state = wrappedState.raw;
  const entity = action.payload;

  const { entitiesByPosition, entitiesByComp } = state;

  for (const key in entity) {
    if (
      entity[key as keyof Entity] &&
      key !== "id" &&
      key !== "template" &&
      key !== "parentTemplate"
    ) {
      entitiesByComp[key] = entitiesByComp[key] || new Set();
      entitiesByComp[key].add(entity.id);
    }
  }

  if (entity.pos) {
    const key = getPosKey(entity.pos);
    entitiesByPosition[key] = entitiesByPosition[key] || new Set();
    entitiesByPosition[key].add(entity.id);
  }

  if (entity.pos && entity.display) {
    wrappedState.renderer.addEntity(
      entity as Required<Entity, "pos" | "display">
    );
  }

  state = {
    ...state,
    entitiesByPosition,
    entitiesByComp,
    entities: {
      ...state.entities,
      [entity.id]: entity,
    },
  };

  wrappedState.setRaw(state);

  if (entity.reflector && entity.pos) {
    retargetLaserOnReflectorChange(wrappedState, entity.pos);
  }
}

registerHandler(addEntityHandler, addEntity);
