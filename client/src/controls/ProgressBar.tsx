import * as React from 'react';
import { styled } from '../style';
import { ButtonSize } from './Button';
import classNames from 'classnames';

const ProgressTrack = styled.div`
  align-items: center;
  background-color: ${props => props.theme.progressTrackColor};
  /* border: 2px solid ${props => props.theme.buttonColors.action.border}; */
  border-radius: 4px;
  color: ${props => props.theme.progressTextColor};
  justify-content: center;
  display: inline-flex;
  overflow: hidden;
  position: relative;
  height: 1.5rem;

  &.small {
    height: 1rem;
  }

  &.smaller {
    height: 0.7rem;
  }

  &.mini {
    height: 0.5rem;
  }
`;

const ProgressThumb = styled.div`
  background: repeating-linear-gradient(
    -45deg,
    ${props => props.theme.progressThumbColor},
    ${props => props.theme.progressThumbColor} 10px,
    ${props => props.theme.progressThumbAltColor} 10px,
    ${props => props.theme.progressThumbAltColor} 20px
  );
  background-attachment: fixed;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
`;

const ProgressContent = styled.div`
  z-index: 1;
`;

interface Props {
  children?: React.ReactNode;
  className?: string;
  value: number;
  min?: number;
  max?: number;
  size?: ButtonSize;
}

export function ProgressBar({ value, min = 0, max = 100, className, size, children }: Props) {
  const percent = Math.min(100, Math.max(0, (value - min) * 100.0 / Math.max(max - min, 1)));
  return (
    <ProgressTrack className={classNames(className, size)}>
      <ProgressContent>{children}</ProgressContent>
      <ProgressThumb style={{ width: `${percent}%` }} />
    </ProgressTrack>
  );
}
