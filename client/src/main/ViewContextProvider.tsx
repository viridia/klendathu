import * as React from 'react';
import { observer } from 'mobx-react';
import { ViewContext, ProjectEnv } from '../models';
import { ErrorDisplay } from '../graphql';
import { RouteComponentProps } from 'react-router';
import { LoadingIndicator } from '../controls';
import { ApolloError } from 'apollo-client';

interface Props extends RouteComponentProps<{ owner: string; name: string }> {
  env: ViewContext;
  children: () => JSX.Element;
}

@observer
export class ViewContextProvider extends React.Component<Props> {
  public componentDidMount() {
    const { owner, name } = this.props.match.params;
    const { env } = this.props;
    env.setParams(owner, name);
  }

  public componentDidUpdate() {
    const { owner, name } = this.props.match.params;
    const { env } = this.props;
    env.setParams(owner, name);
  }

  public componentWillUnmount() {
    const { env } = this.props;
    env.reset();
  }

  public render() {
    const { env } = this.props;
    if (env.error) {
      return <ErrorDisplay error={env.error as ApolloError} />;
    } else if (env.loading) {
      return <LoadingIndicator>Loading&hellip;</LoadingIndicator>;
    } else if (!env.project) {
      return null;
    }
    const { children } = this.props;
    return (
      <ProjectEnv.Provider value={env}>{children()}</ProjectEnv.Provider>
    );
  }
}
