import * as React from 'react';
import { StatesRingChart } from '../stats/StatesRingChart';
import { TypesRingChart } from '../stats/TypesRingChart';
import { styled } from '../style';
import { OwnerBarChart } from '../stats/OwnerBarChart';
import { Card } from '../controls';

const DashboardLayout = styled.section`
  display: grid;
  grid-gap: .5rem;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "states types"
    "owners owners";
  overflow-x: hidden;
  overflow-y: auto;
  align-content: start;
  flex: 1;
`;

const RingCard = styled(Card)`
  flex: 1;
  height: 360px;

  > section {
    height: 300px;
    flex: 1;
    align-self: stretch;
  }
`;

const BarCard = styled(Card)`
  flex: 1;
  grid-area: owners;

  > section {
    flex: 1;
    align-self: stretch;
  }
`;

export function Dashboard() {
  return (
    <DashboardLayout>
      <RingCard>
        <header>Issue states</header>
        <StatesRingChart />
      </RingCard>
      <RingCard>
        <header>Issue types</header>
        <TypesRingChart />
      </RingCard>
      <BarCard>
        <header>Owners</header>
        <OwnerBarChart />
      </BarCard>
    </DashboardLayout>
  );
}
