import * as React from 'react';
import { register } from '../registry';
import { ProgressBar } from '../../controls';
import { styled } from '../../style';

const DemoProgress = styled(ProgressBar)`
  width: 20rem;
  margin-bottom: 4px;
`;

function Demo() {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setValue(c => c + 0.3);
    }, 16);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <React.Fragment>
      <DemoProgress value={value} max={500}>{Math.ceil(value / 5)}%</DemoProgress>
      <DemoProgress value={value} max={500} size="small" />
      <DemoProgress value={value} max={500} size="smaller" />
      <DemoProgress value={value} max={500} size="mini" />
    </React.Fragment>
  );
}

function Progress() {
  return (
    <React.Fragment>
      <header>Progress</header>
      <Demo/>
    </React.Fragment>
  );
}

register('progress', Progress);
