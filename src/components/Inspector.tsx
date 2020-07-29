import React from "react";
import { useSelector, useDispatch } from "react-redux";
import selectors from "~state/selectors";
import { getActionsAvailableAtPos } from "~utils/controls";
import { useShortcuts } from "~hooks";

export default function Inspector() {
  const dispatch = useDispatch();
  const entitiesAtCursor = useSelector(selectors.entitiesAtCursor);
  const entitiesWithDescription =
    entitiesAtCursor && entitiesAtCursor.filter((e) => e.description);
  const cursorPos = useSelector(selectors.cursorPos);
  const state = useSelector(selectors.state);
  const actions = cursorPos ? getActionsAvailableAtPos(state, cursorPos) : [];
  useShortcuts(
    Object.fromEntries<() => void>(
      actions
        .filter((a) => !a.doNotRegisterShortcut)
        .map((action): [string, () => void] => [
          action.key,
          () => dispatch(action.action),
        ]),
    ),
  );
  return (
    <section className="p-2 border-b border-gray">
      <h2 className="text-xl">Inspector</h2>
      <ul className="ml-3">
        {entitiesWithDescription && entitiesWithDescription.length ? (
          entitiesWithDescription.map((e) =>
            e.description ? <li key={e.id}>{e.description.name}</li> : null,
          )
        ) : (
          <li>Nothing here</li>
        )}
      </ul>
      <h2 className="text-xl mt-2">Available Actions</h2>
      {actions.length > 0 && (
        <div className="text-lightGray text-sm opacity-75 mb-2">
          Right click map or use shortcuts
        </div>
      )}
      <ul className="ml-3">
        {actions.length === 0 && <li>None</li>}
        {actions.map((action) => (
          <li key={action.label} className="mb-1">
            <button type="button" className="font-normal">
              <kbd className="font-mono bg-darkGray rounded p-1 mr-1">
                {action.key}
              </kbd>
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}