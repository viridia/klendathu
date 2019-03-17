import * as React from 'react';
import { styled } from '../style';

const ProgressTrack = styled.div`
  display: inline-block;
  position: relative;
  height: 1rem;
`;

const ProgressThumb = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
`;

interface Props {
  value: number;
  min?: number;
  max?: number;
}

export function ProgressBar({ value, min = 0, max = 100 }: Props) {
  const percent = (value - min) * 100.0 / Math.max(max - min, 1);
  return (
    <ProgressTrack>
      <ProgressThumb style={{ width: `${percent}%` }} />
    </ProgressTrack>
  );
}
