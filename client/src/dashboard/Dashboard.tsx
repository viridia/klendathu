import * as React from 'react';
import { StatesRingChart } from '../stats/StatesRingChart';
import { TypesRingChart } from '../stats/TypesRingChart';
import { styled } from '../style';

const DashboardLayout = styled.section`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  > * {
    height: 360px;
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
`;

export function Dashboard() {
  return (
    <DashboardLayout>
      <StatesRingChart />
      <TypesRingChart />
    </DashboardLayout>
  );
}
