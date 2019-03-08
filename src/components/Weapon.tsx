import React from "react";
import { Weapon } from "../types";
import { RED, YELLOW, PURPLE, BLACK, GREEN } from "../constants";

export default function Weapon({
  slot,
  weapon,
}: {
  slot: string;
  weapon: Weapon | null;
}) {
  if (!weapon) {
    return (
      <div className="box weapon">
        <div className="box__label weapon__label">{slot}: None</div>
      </div>
    );
  }
  let status = "READY";
  if (weapon.active) status = "TARGETING";
  if (weapon.readyIn) status = `CHARGING (${weapon.readyIn})`;

  let weaponTypeColor = RED;
  if (weapon.type === "ELECTRIC") weaponTypeColor = YELLOW;
  if (weapon.type === "TELEPORT") weaponTypeColor = PURPLE;

  let statusStyle = { background: BLACK, color: GREEN };
  if (status.startsWith("CHARGING")) statusStyle.color = RED;
  if (status === "TARGETING") statusStyle = { background: GREEN, color: BLACK };

  return (
    <div className="box weapon">
      <div className="box__label weapon__label">
        {slot}: {weapon.name}
      </div>
      <div>
        Type: <span style={{ color: weaponTypeColor }}>{weapon.type}</span>
      </div>
      <div>
        Status: <span style={statusStyle}>{status}</span>
      </div>
      <div>Power: {weapon.power}</div>
      <div>Cooldown: {weapon.cooldown}</div>
    </div>
  );
}
