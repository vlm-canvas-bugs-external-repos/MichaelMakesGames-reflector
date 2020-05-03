import WrappedState from "~types/WrappedState";
import { Entity } from "~types";
import { getAdjacentPositions } from "./geometry";

const conditions: Record<
  ConditionName,
  (state: WrappedState, entity: Entity) => boolean
> = {
  doesNotHaveTallNeighbors(state, entity) {
    if (!entity.pos) return false;
    return getAdjacentPositions(entity.pos).every((pos) =>
      state.select
        .entitiesAtPosition(pos)
        .every((neighbor) => !neighbor.blocking || !neighbor.blocking.lasers),
    );
  },

  isDay(state, entity) {
    return !state.select.isNight();
  },

  isPowered(state, entity) {
    return Boolean(entity.powered && entity.powered.hasPower);
  },

  hasOneActiveWorker(state, entity) {
    return (
      state.select
        .employees(entity)
        .filter((employee) => employee.colonist.isWorking).length >= 1
    );
  },

  hasTwoActiveWorkers(state, entity) {
    return (
      state.select
        .employees(entity)
        .filter((employee) => employee.colonist.isWorking).length >= 2
    );
  },

  hasThreeActiveWorkers(state, entity) {
    return (
      state.select
        .employees(entity)
        .filter((employee) => employee.colonist.isWorking).length >= 3
    );
  },
};

export function areConditionsMet(
  state: WrappedState,
  entity: Entity,
  ...conditionNames: (ConditionName | null)[]
) {
  return conditionNames.every(
    (name) => !name || conditions[name](state, entity),
  );
}
