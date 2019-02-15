import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewContext } from '../models';
import { ErrorListDisplay } from '../graphql';
import { RouteComponentProps } from 'react-router';
import { LoadingIndicator } from '../controls';

interface Props extends RouteComponentProps<{ owner: string, name: string }> {
  viewContext: ViewContext;
  children: () => JSX.Element;
}

@observer
export class ViewContextProvider extends React.Component<Props> {
  public componentDidMount() {
    const { owner, name } = this.props.match.params;
    const { viewContext } = this.props;
    viewContext.setParams(owner, name);
  }

  public componentDidUpdate() {
    const { owner, name } = this.props.match.params;
    const { viewContext } = this.props;
    viewContext.setParams(owner, name);
  }

  public componentWillUnmount() {
    const { viewContext } = this.props;
    viewContext.reset();
  }

  public render() {
    const { viewContext } = this.props;
    if (viewContext.loading) {
      return <LoadingIndicator>Loading&hellip;</LoadingIndicator>;
    } else if (viewContext.errors) {
      return <ErrorListDisplay errors={viewContext.errors} />;
    } else if (!viewContext.project) {
      return null;
    }
    const { children } = this.props;
    return children();
  }
}
