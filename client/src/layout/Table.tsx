import styled from 'styled-components';

export const Table = styled.table`
  border-collapse: collapse;
  td, th {
    &.center {
      text-align: center;
    }
    &.left {
      text-align: left;
    }
    &.right {
      text-align: right;
    }

    &.pad {
      padding: 8px 7px 8px 7px;
    }
  }

  tr:nth-child(even) {
    background: ${props => props.theme.cardBgColorAltRow};
  }
`;

export const TableHead = styled.thead`
  box-shadow: 0px 3px 2px 0 ${props => props.theme.cardShadowColor};

  > tr > th {
    padding: 6px 1rem;
    border-right: 1px solid ${props => props.theme.cardHeaderDividerColor};
  }
`;

export const TableBody = styled.tbody`
  border-bottom: 3px solid transparent;

  > tr > td {
    padding-top: 3px;
    padding-bottom: 3px;
  }

  > tr:first-child > td {
    border-top: 1px solid ${props => props.theme.cardHeaderDividerColor};
    padding-top: 6px;
  }

  > tr:last-child > td {
    padding-bottom: 3px;
  }

  > tr > td:last-child {
    border-right: 1px solid ${props => props.theme.cardHeaderDividerColor};
  }
`;

export const TableRow = styled.tr``;

export const ActionButtonCell = styled.td`
  &.right > * {
    margin-right: .3rem;
  }
`;
