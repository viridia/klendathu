import bind from 'bind-decorator';
import * as React from 'react';

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
      <button className={className} onClick={this.onClick}>
        {children}
        {sortKey === column ?
          (descending
            ? <span className="sort descend">&#x25bc;</span>
            : <span className="sort ascend">&#x25b2;</span>)
          : <span className="sort">&nbsp;</span>}
      </button>
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
