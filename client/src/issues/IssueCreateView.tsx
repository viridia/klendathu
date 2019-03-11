import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IssueCompose } from './IssueCompose';
import { toast } from 'react-toastify';
import { IssueInput, Issue } from '../../../common/types/graphql';
import { ViewContext, ProjectEnv } from '../models';
import { newIssue } from '../graphql';
import { decodeErrorAsException } from '../graphql/client';
import { idToIndex } from '../lib/idToIndex';

interface Props extends RouteComponentProps<{}> {
  env: ViewContext;
}

export function IssueCreateView(props: Props) {
  const env = React.useContext(ProjectEnv);
  const onSave = (input: IssueInput): Promise<Issue> => {
    const { project } = env;
    return newIssue({ project: project.id, input }).then(({ data, errors }) => {
      if (errors) {
        // TODO: more information
        toast.error('Issue creation failed.');
        // TODO: An error UI.
        decodeErrorAsException(errors);
      } else {
        toast.success(`Issue #${idToIndex(data.newIssue.id)} created.`);
        return data.newIssue;
      }
    });
  };

  return <IssueCompose {...props} onSave={onSave} />;
}
