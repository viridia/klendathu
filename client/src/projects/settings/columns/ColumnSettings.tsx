import * as React from 'react';
import { Column } from './Column';
import { ColumnList } from './ColumnList';
import { computed, IObservableArray, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ViewContext } from '../../../models';
import { Button, CardTitle } from '../../../controls';
import { SettingsPane, Spacer } from '../../../layout';
import { styled } from '../../../style';
import { fragments } from '../../../graphql';
import { Mutation } from '../../../../../common/types/graphql';
import { client, decodeErrorAsException } from '../../../graphql/client';
import bind from 'bind-decorator';
import gql from 'graphql-tag';

const SetPrefsColumnsMutation = gql`
  mutation SetPrefsColumnsMutation($project: ID!, $columns: [String!]!) {
    setPrefColumns(project: $project, columns: $columns) { ...ProjectPrefsFields }
  }
  ${fragments.projectPrefs}
`;

type SetPrefsColumnsMutationResult = Pick<Mutation, 'setPrefColumns'>;

const ColumnSettingsLayout = styled.section`
  display: flex;
  justify-content: flex-start;
  flex: 1;
`;

const ColumnChoice = styled.section`
  display: flex;
  flex-direction: column;
  margin: 1rem;

  > header {
    font-weight: bold;
    margin-bottom: 8px;
    align-self: center;
  }
`;

const ColumnHelp = styled.section`
  margin: 1.4rem 0;
  max-width: 16rem;
`;

interface Props {
  env: ViewContext;
}

/** Component which allows editing the list of columns. */
@observer
export class ColumnSettings extends React.Component<Props> {
  @observable private busy = false;
  @observable private visible = [] as IObservableArray<string>;
  @observable private original = [] as IObservableArray<string>;

  constructor(props: Props) {
    super(props);
    const { prefs } = props.env;
    this.original.replace(prefs.columns);
    this.visible.replace(prefs.columns);
  }

  public render() {
    const { prefs } = this.props.env;
    if (!prefs) {
      return <section className="settings-tab-pane" />;
    }
    const visibleColumns = this.visible.map(id => this.columnMap.get(id));
    const availableColumns = this.columns.filter(col => this.visible.indexOf(col.id) < 0);
    const canSave = this.isChanged && !this.busy;
    return (
      <SettingsPane>
        <header>
          <CardTitle>Issue List Columns</CardTitle>
          <Spacer />
          <Button kind="primary" onClick={this.onSave} disabled={!canSave}>
            Save
          </Button>
        </header>
        <ColumnSettingsLayout>
          <ColumnChoice>
            <header>Available Columns</header>
            <ColumnList columns={availableColumns} onDrop={this.onDrop} />
          </ColumnChoice>
          <ColumnChoice>
            <header>Visible Columns</header>
            <ColumnList columns={visibleColumns} onDrop={this.onDrop} isVisible={true} />
          </ColumnChoice>
          <ColumnHelp>
            <p>
              Drag columns between groups to select which columns to view, and the order
              in which they should be displayed.
            </p>
            <p>
              Column settings only affect you, not other project members.
            </p>
          </ColumnHelp>
        </ColumnSettingsLayout>
      </SettingsPane>);
  }

  @bind
  private onSave(e: any) {
    const { env } = this.props;
    e.preventDefault();
    this.busy = true;
    client.mutate<SetPrefsColumnsMutationResult>({
      mutation: SetPrefsColumnsMutation,
      variables: {
        project: env.project.id,
        columns: this.visible.slice(),
      }
    }).then(({ data, errors }) => {
      this.busy = false;
      if (errors) {
        decodeErrorAsException(errors);
      }
      return data.setPrefColumns;
    }, error => {
      env.mutationError = error;
      this.busy = false;
    });
  }

  @bind
  private onDrop(lcId: string, index: number, visible: boolean, makeVisible: boolean) {
    // Because DnD lowercases drag types.
    const col = this.columns.find(c => c.id.toLowerCase() === lcId);
    if (col) {
      if (visible) {
        const oldIndex = this.visible.indexOf(col.id);
        if (!makeVisible) {
          this.visible.splice(oldIndex, 1);
          return;
        }
        let newIndex = index;
        if (oldIndex > 0 && oldIndex < index) {
          newIndex -= 1;
        }
        this.visible.splice(oldIndex, 1);
        this.visible.splice(newIndex, 0, col.id);
      } else {
        this.visible.splice(index, 0, col.id);
      }
    }
  }

  @computed
  private get isChanged() {
    if (this.original.length !== this.visible.length) {
      return true;
    }
    for (let i = 0; i < this.original.length; i += 1) {
      if (this.original[i] !== this.visible[i]) {
        return true;
      }
    }
    return false;
  }

  @computed
  private get columns(): Column[] {
    const { template } = this.props.env;
    const columns: Column[] = [
      { id: 'created', title: 'Created' },
      { id: 'updated', title: 'Updated' },
      { id: 'type', title: 'Type' },
      { id: 'reporter', title: 'Reporter' },
      { id: 'owner', title: 'Owner' },
      { id: 'state', title: 'State' },
      { id: 'milestone', title: 'Milestone' },
    ];
    if (template) {
      for (const type of template.types) {
        for (const field of (type.fields || [])) {
          const columnId = `custom.${field.id}`;
          if (!columns.find(col => col.id === columnId)) {
            columns.push({ id: columnId, title: field.caption });
          }
        }
      }
    }
    return columns;
  }

  @computed
  private get columnMap(): Map<string, Column> {
    const columnMap = new Map();
    this.columns.forEach(col => { columnMap.set(col.id, col); });
    return columnMap;
  }
}
