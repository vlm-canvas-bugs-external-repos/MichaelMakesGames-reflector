import Tippy from "@tippyjs/react";
import React from "react";
import { useSelector } from "react-redux";
import { MINUTES_PER_TURN, NEW_COLONISTS_PER_DAY } from "~constants";
import selectors from "~state/selectors";

export default function Status() {
  const time = useSelector(selectors.time);
  const day = useSelector(selectors.day);
  const isNight = useSelector(selectors.isNight);
  const turnsUntilSunriseOrSunset = useSelector(
    selectors.turnsUntilSunriseOrSunset,
  );
  const population = useSelector(selectors.population);
  const housingCapacity = useSelector(selectors.housingCapacity);
  const morale = useSelector(selectors.morale);
  return (
    <section className="p-2 border-b border-gray">
      <div className="flex flex-row justify-between items-start mb-2">
        <div className="flex flex-col">
          <Tippy
            content={
              <>
                <p className="mb-2">This is the current time.</p>
                <p className="mb-2">
                  Each turn is {MINUTES_PER_TURN} minutes. Moving, building,
                  shooting, and waiting all take a turn. Everything else happens
                  instantly.
                </p>
                <p className="mb-2">
                  During the day (6:00am - 6:00pm), colonists go to work to
                  produce various resources.
                </p>
                <p className="mb-2">
                  At night, colonists go home and enemies attack.
                </p>
                <p className="mb-2">
                  Each morning, {NEW_COLONISTS_PER_DAY} new colonists will
                  arrive.
                </p>
                <p>Survive 10 days to win!</p>
              </>
            }
          >
            <p className="text-xl">
              {isNight ? "Night" : "Day"} {day + 1}, {time}
            </p>
          </Tippy>
          <p className="text-lightGray">
            {turnsUntilSunriseOrSunset}{" "}
            {turnsUntilSunriseOrSunset === 1 ? "turn" : "turns"} until{" "}
            {isNight ? "sunrise" : "sunset"}
          </p>
        </div>
      </div>
      <div className="flex flex-row">
        <Tippy content="This represents the confidence and discipline of your colony. You lose morale every time a colonist dies, or if you don't have enough food at night. If you ever reach 0 morale, you lose!">
          <p>
            <span className="text-lightGray">Morale: </span>
            {morale}
          </p>
        </Tippy>
        <Tippy content="This is your current population / your housing capacity. At night, colonists will return to their residences. If you don't have enough, they will build temporary tents wherever they are.">
          <p>
            <span className="text-lightGray ml-3">Population: </span>
            {population}
            <span className="text-lightGray"> / {housingCapacity}</span>
          </p>
        </Tippy>
      </div>
    </section>
  );
}
