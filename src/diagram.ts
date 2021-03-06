import { Arrow, Span, States, Diagram } from "./parser";

export type ProcessedTick = { [key: string]: number };

export type ProcessedDiagram = {
  title: string;
  lifelines: {
    [key: string]: {
      style: "simplified" | "normal";
    };
  };
  spans: Span[];
  states: States;
  ticks: ProcessedTick[];
  arrows: Arrow[];
};

export function interpolateTicks(d: Diagram): ProcessedTick[] {
  const tMax = d.ticks.reduce((acc, curr) => {
    if (curr.time > acc) {
      return curr.time;
    }
    return acc;
  }, 0);

  const prevStates = Object.keys(d.states).reduce((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {} as ProcessedTick);

  const newTicks = [];
  for (let i = 0; i <= tMax; i++) {
    const ticksForCurrentT = d.ticks.filter((t) => t.time === i);
    const missingLifelines = Object.keys(prevStates).filter(
      (d) => !ticksForCurrentT.some((t) => t.lifeline === d)
    );

    const newTick: ProcessedTick = ticksForCurrentT.reduce((acc, curr) => {
      acc[curr.lifeline] = curr.state_idx;
      return acc;
    }, {} as ProcessedTick);

    missingLifelines.forEach((l) => {
      newTick[l] = prevStates[l];
    });

    Object.entries(newTick).forEach(([l, v]) => {
      prevStates[l] = v;
    });

    newTicks.push(newTick);
  }

  return newTicks;
}
