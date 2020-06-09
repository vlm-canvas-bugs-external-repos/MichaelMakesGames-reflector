import Tooltip from "rc-tooltip";
import React from "react";
import { useSelector } from "react-redux";
import resources, { Resource } from "~data/resources";
import selectors from "~state/selectors";
import { RawState } from "~types";
import ResourceIcon from "./ResourceIcon";

export default function Resources() {
  return (
    <section className="p-2 border-b border-gray">
      <h2 className="text-xl">Resources</h2>
      <table className="w-full">
        <thead className="hidden">
          <tr>
            <th />
            <th>Resource</th>
            <th>Amount</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody className="w-full">
          {Object.values(resources).map((r) => (
            <ResourceRow resource={r} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ResourceRow({ resource }: { resource: Resource }) {
  const amount = useSelector((state: RawState) =>
    selectors.resource(state, resource.code),
  );
  const changes = useSelector((state: RawState) =>
    selectors.resourceChange(state, resource.code),
  );
  const totalChange = changes.reduce((acc, cur) => acc + cur.amount, 0);
  const formatNumber = Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format;
  const getChangeColorClass = (change: number) => {
    if (change > 0) return "text-green";
    if (change < 0) return "text-red";
    return "text-lightGray";
  };

  return (
    <tr className="flex flex-row items-center">
      <td className="flex-initial">
        <ResourceIcon resourceCode={resource.code} />
      </td>
      <td className="flex-1">{resource.label}</td>
      <td className="flex-1 text-right">{formatNumber(amount)}</td>
      <Tooltip
        placement="right"
        overlay={
          <table>
            {changes.length === 0 && (
              <tr>
                <td>No changes</td>
              </tr>
            )}
            {changes.map((change) => (
              <tr key={change.reason}>
                <td>{change.reason}</td>
                <td
                  className={`text-right pl-2 ${getChangeColorClass(
                    change.amount,
                  )}`}
                >
                  {change.amount > 0 ? "+" : null}
                  {formatNumber(change.amount)}
                </td>
              </tr>
            ))}
          </table>
        }
      >
        <td className={`flex-1 text-right ${getChangeColorClass(totalChange)}`}>
          {totalChange > 0 ? "+" : null}
          {formatNumber(totalChange)}
        </td>
      </Tooltip>
    </tr>
  );
}
