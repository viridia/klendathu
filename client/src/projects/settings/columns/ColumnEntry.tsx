import * as React from 'react';
import { Column } from './Column';
import bind from 'bind-decorator';

interface Props {
  column: Column;
  isVisible: boolean;
}

/** A single entry in the list of columns */
export class ColumnEntry extends React.Component<Props> {
  public render() {
    const { column } = this.props;
    return (
      <div
          draggable={true}
          onDragStart={this.onDragStart}
      >
        {column.title}
      </div>
    );
  }

  @bind
  private onDragStart(e: any) {
    const { isVisible, column } = this.props;
    e.dataTransfer.setData(`column/${column.id}/${!!isVisible}`, '');
    e.dataTransfer.dropEffect = 'move';
  }
}
