import { Action, GameState } from "~/types";
import {
  BASE_IMMIGRATION_RATE,
  STARTING_MORALE,
  TURNS_BETWEEN_WAVES_BASE,
  UP,
  DOWN,
  LEFT,
  RIGHT,
  STARTING_METAL,
  VERSION,
} from "~constants";
import handleAction from "./handleAction";
import "./handlers";
import { choose } from "~utils/rng";

const initialState: GameState = {
  version: VERSION,
  entities: {},
  entitiesByPosition: {},
  messageLog: [],
  gameOver: false,
  victory: false,
  turnsUntilNextImmigrant: BASE_IMMIGRATION_RATE,
  morale: STARTING_MORALE,
  wave: {
    turnsUntilCurrentWaveEnd: 0,
    turnsUntilNextWaveStart: TURNS_BETWEEN_WAVES_BASE,
    direction: choose([UP, DOWN, LEFT, RIGHT]),
  },
  isBuildMenuOpen: false,
  resources: {
    METAL: STARTING_METAL,
  },
};

export default function reducer(
  state: GameState = initialState,
  action: Action,
): GameState {
  return handleAction(state, action);
}
