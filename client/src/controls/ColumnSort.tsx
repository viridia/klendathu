import bind from 'bind-decorator';
import * as React from 'react';
import styled from 'styled-components';

const ColumnSortEl = styled.button`
  background-color: transparent;
  border: none;
  box-shadow: none;
  cursor: pointer;
  font-weight: bold;
  outline: none;
  width: 100%;
  > .content {
    padding-left: 1rem;
  }
  > .sort {
    display: inline-block;
    width: 12px;
    color: ${props => props.theme.buttonColors.primary.bg};
    margin-right: 4px;
  }
`;

interface Props {
  className?: string;
  column: string;
  sortKey?: string;
  descending?: boolean;
  children: React.ReactNode;
  onChangeSort: (column: string, descending: boolean) => void;
}

/** Component that functions as a column heading and allows control of sort order for that
    column. */
export class ColumnSort extends React.Component<Props> {
  public render() {
    const { className, column, children, sortKey, descending } = this.props;
    return (
      <ColumnSortEl className={className} onClick={this.onClick}>
        <span className="content">{children}</span>
        {sortKey === column ?
          (descending
            ? <span className="sort descend">&#x25b2;</span>
            : <span className="sort ascend">&#x25bc;</span>)
          : <span className="sort">&nbsp;</span>}
      </ColumnSortEl>
    );
  }

  @bind
  private onClick(e: any) {
    e.preventDefault();
    const { column, sortKey, descending, onChangeSort } = this.props;
    if (column !== sortKey) {
      // If this is not the current column then it always sorts descending.
      onChangeSort(column, false);
    } else {
      // Otherwise it toggles the sort order.
      onChangeSort(column, !descending);
    }
  }
}
