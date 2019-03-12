import * as React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Filter } from '../../../common/types/graphql';
import { Dialog, Button, Card } from '../controls';
import { Role } from '../../../common/types/json';
import {
  ModeContent,
  ModeContentHeader,
  ModeContentTitle,
  Table,
  TableHead,
  TableBody,
  ActionButtonCell,
} from '../layout';
import { styled } from '../style';
import { ViewContext } from '../models';
import { removePrefsFilter } from '../graphql/mutations';

const EmptyList = styled.section`
  margin: 1rem;
  font-style: italic;
`;

const FilterListViewTable = styled(Table)`
  .label-id {
    width: 2rem;
  }

  .visible {
    width: 3rem;
    > * {
      align-items: center;
      display: flex;
      justify-content: center;
      width: 100%;
    }
  }

  .name {
    width: 12rem;
  }

  .actions {
    width: 10rem;
  }
`;

interface Props {
  env: ViewContext;
}

@observer
export class FilterListView extends React.Component<Props> {
  @observable private showDelete = false;
  @observable private filterToDelete?: Filter = null;
  @observable private busy = false;

  public render() {
    const { project } = this.props.env;
    if (!project) {
      return null;
    }
    return (
      <ModeContent>
        {this.showDelete && (
          <Dialog open={true} onClose={this.onHideDelete}>
            <Dialog.Header hasClose={true}>Delete Filter</Dialog.Header>
            <Dialog.Body>
              Are you absolutely sure you want to filter &apos;{this.filterToDelete.name}&apos;?
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={this.onHideDelete}>Cancel</Button>
              <Button kind="primary" onClick={this.onDeleteFilter} disabled={this.busy}>
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog>
        )}
        <ModeContentHeader>
          <ModeContentTitle>Saved Filters</ModeContentTitle>
        </ModeContentHeader>
        {this.renderFilters()}
      </ModeContent>
    );
  }

  private renderFilters() {
    const { project, prefs } = this.props.env;
    const filters = prefs.filters;
    if (filters.length === 0) {
      return (
        <Card>
          <EmptyList>No filters found</EmptyList>
        </Card>
      );
    }
    return (
      <Card>
        <FilterListViewTable>
          <TableHead>
            <tr>
              <th className="name center">Name</th>
              <th className="view center">View</th>
              <th className="params center">Query</th>
              {project.role >= Role.DEVELOPER && <th className="actions">Actions</th>}
            </tr>
          </TableHead>
          <TableBody>
            {filters.map(filter => this.renderFilter(filter))}
          </TableBody>
        </FilterListViewTable>
      </Card>
    );
  }

  private renderFilter(filter: Filter) {
    const { project } = this.props.env;
    return (
      <tr key={filter.name}>
        <td className="name center">{filter.name}</td>
        <td className="view center">{filter.view}</td>
        <td className="para center">{filter.value}</td>
        {project.role >= Role.DEVELOPER && (<ActionButtonCell className="right">
          <Button
              kind="action"
              className="small"
              data-filter={filter.name}
              onClick={e => this.onShowDelete(filter)}
          >
            Delete
          </Button>
        </ActionButtonCell>)}
      </tr>);
  }

  @action.bound
  private onShowDelete(filter: Filter) {
    this.showDelete = true;
    this.filterToDelete = filter;
  }

  @action.bound
  private onHideDelete() {
    this.showDelete = false;
  }

  @action.bound
  private onDeleteFilter() {
    const { project } = this.props.env;
    this.busy = true;
    removePrefsFilter({ project: project.id, name: this.filterToDelete.name })
    .then(() => {
      this.busy = false;
    }, error => {
      this.busy = false;
      this.props.env.mutationError = error;
    });
  }
}
