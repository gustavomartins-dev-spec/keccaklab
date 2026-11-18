import type { FloydFrame, RhoNode, RhoResult } from '../types/experiments';
import { createTruncatedKeccak200 } from './keccak200';

/** A bounded, separate visualization pass: at most 24 nodes and 49 frames. */
export function buildRhoVisualization(result: RhoResult): { nodes: RhoNode[]; frames: FloydFrame[]; condensed: boolean } {
  const hash = createTruncatedKeccak200(result.bits);
  const nodes: RhoNode[] = [];
  const appendGroup = (group: 'tail' | 'cycle', start: number, length: number, initial: number, last: number, limit: number) => {
    let value = initial;
    const visible = Math.min(length, limit);
    for (let i = 0; i < visible; i++) {
      nodes.push({ id: String(start + i), index: start + i, value, group });
      if (i + 1 < visible) value = hash(value);
    }
    if (length > limit) {
      const omitted = length - limit - 1;
      if (omitted > 0) nodes.push({id: group + '-gap', index: null, value: null, group, omitted});
      nodes.push({id: String(start + length - 1), index: start + length - 1, value: last, group});
    }
  };
  appendGroup('tail', 0, result.cycleStart, result.seed, result.collisionInputs[0], 6);
  appendGroup('cycle', result.cycleStart, result.cycleLength, result.collisionValue, result.collisionInputs[1], 14);
  const frames: FloydFrame[] = [];
  let tortoise = result.seed;
  let hare = result.seed;
  for (let step = 1; step <= Math.min(result.meetingStep, 48); step++) {
    tortoise = hash(tortoise);
    hare = hash(hash(hare));
    frames.push({step, tortoise, hare});
  }
  if (result.meetingStep > 48) frames.push({step:result.meetingStep, tortoise:result.meetingValue, hare:result.meetingValue});
  return {nodes, frames, condensed:nodes.some(node => node.omitted) || result.meetingStep > 48};
}

export function canonicalIndex(index: number, result: RhoResult): number {
  return index < result.cycleStart ? index : result.cycleStart + (index - result.cycleStart) % result.cycleLength;
}
