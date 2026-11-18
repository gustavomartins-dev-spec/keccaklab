import { describe,expect,it } from 'vitest';
import { buildRhoVisualization,canonicalIndex } from './rhoVisualization';
import { hashToBits,runPollardRho } from './pollardRho';

describe('traço visual separado de Floyd',()=>{
  it('mantém a animação fiel à sequência real de cada ponteiro',()=>{
    const result=runPollardRho(8);
    const {frames,nodes}=buildRhoVisualization(result);
    let tortoise=result.seed,hare=result.seed;
    for(const frame of frames){
      tortoise=hashToBits(tortoise,8);
      hare=hashToBits(hashToBits(hare,8),8);
      expect(frame.tortoise).toBe(tortoise);
      expect(frame.hare).toBe(hare);
    }
    expect(frames[frames.length-1].tortoise).toBe(frames[frames.length-1].hare);
    expect(nodes.find(node=>node.index===result.cycleStart)?.value).toBe(result.collisionValue);
    expect(canonicalIndex(result.collisionIndex,result)).toBe(result.cycleStart);
  });
  it('limita memória visual mesmo para trajetórias longas e informa os saltos',()=>{
    const result=runPollardRho(16);
    const visualization=buildRhoVisualization(result);
    expect(visualization.nodes.length).toBeLessThanOrEqual(24);
    expect(visualization.frames.length).toBeLessThanOrEqual(49);
    expect(visualization.condensed).toBe(true);
    expect(visualization.nodes.some(node=>node.omitted)).toBe(true);
    expect(visualization.frames[visualization.frames.length-1].step).toBe(result.meetingStep);
  });
});
