import * as React from 'react';
import { ColumnRenderer } from './ColumnRenderer';
import { Issue } from '../../../../common/types/graphql';
import { FieldType } from '../../../../common/types/json';
import { ColumnSort } from '../../controls';
import classNames from 'classnames';

export class CustomColumnRenderer implements ColumnRenderer {
  protected title: string;
  protected field: FieldType;
  protected className: string;

  constructor(field: FieldType) {
    this.field = field;
    this.title = this.field.caption;
    this.className = classNames(
      'custom pad', {
        center: field.align === 'center',
        right: field.align === 'right',
      });
  }

  public renderHeader(
      sort: string,
      descending: boolean,
      onChangeSort: (column: string, descending: boolean) => void) {
    return (
      <th className={this.className} key={this.field.id}>
        <ColumnSort
            column={`custom.${this.field.id}`}
            sortKey={sort}
            className="sort"
            descending={descending}
            onChangeSort={onChangeSort}
        >
          {this.title}
        </ColumnSort>
      </th>
    );
  }

  public render(issue: Issue) {
    if (issue.custom) {
      const cv = issue.custom.find(cf => cf.key === this.field.id);
      if (cv) {
        return <td key={this.field.id} className={this.className}>{cv.value}</td>;
      }
    }
    return <td className="custom" key={this.field.id} />;
  }
}
