import * as React from 'react';
import styled from 'styled-components';
import { ApolloError } from 'apollo-client';
import { GraphQLError } from 'graphql';
import { Errors } from '../../../common/types/json';
import { Observer } from 'mobx-react';
import { ViewContext } from '../models';
import { Dialog, Button } from 'skyhook-ui';

const ErrorList = styled.section`
  background-color: #000;
  color: #f66;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
`;

const ErrorItem = styled.section`
  margin-bottom: 1rem;
  > header {
    align-items: center;
    background-color: #400;
    color: #f88;
    display: flex;
    flex-direction: row;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    padding: .5rem;

    > .title {
      color: #faa;
      font-weight: bold;
      margin-right: .6rem;
    }
  }
`;

const ErrorTable = styled.section`
  display: grid;
  grid-auto-flow: row;
  grid-column-gap: .5rem;
  grid-row-gap: .5rem;
  grid-template-columns: [label] 6rem [content] 1fr;
`;

const ErrorRowLabel = styled.div`
  color: #faa;
  font-weight: bold;
  grid-column: label;
  white-space: nowrap;
  justify-self: end;
`;

const ErrorRowData = styled.div`
  grid-column: content;
  white-space: pre-wrap;
`;

const ErrorRowDataPre = styled(ErrorRowData)`
  font-family: monospace;
  font-size: 0.9rem;
`;

const UserError = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
`;

export function ErrorListDisplay({ errors }: { errors: ReadonlyArray<GraphQLError> }) {
  for (const err of errors) {
    // console.error(JSON.stringify(err, null, 2));
    if (err.message === Errors.NOT_FOUND) {
      if (err.extensions.exception.object === 'project') {
        return <UserError>Error: Project not found</UserError>;
      } else if (err.extensions.exception.object === 'account') {
        return <UserError>Error: Account not found</UserError>;
      } else {
        return <UserError>Error: Resource not found</UserError>;
      }
    }
  }
  return (
    <ErrorList className="error-list">
      {(errors || []).map((gqlError, index) => (
        <ErrorItem key={index}>
          <header>
            <div className="title">GraphQL Error:</div>
            <div className="message">{gqlError.message}</div>
          </header>
          <ErrorTable className="error-table">
            {gqlError.extensions && gqlError.extensions.code && (
              <React.Fragment>
                <ErrorRowLabel>Error code:</ErrorRowLabel>
                <ErrorRowData>{gqlError.extensions.code}</ErrorRowData>
              </React.Fragment>
            )}
            {gqlError.extensions &&
              gqlError.extensions.exception &&
              gqlError.extensions.exception.stacktrace && (
              <React.Fragment>
                <ErrorRowDataPre>
                  {gqlError.extensions.exception.stacktrace.map(
                    (line: string, i: number) => <div key={i}>{line}</div>)}
                </ErrorRowDataPre>
              </React.Fragment>
            )}
          </ErrorTable>
        </ErrorItem>
      ))}
    </ErrorList>
  );
}

export function NetworkErrorsDisplay({ errors }: { errors: any[] }) {
  return (
    <ErrorList className="error-list">
      {(errors || []).map((e, index) => (
        <ErrorItem key={index}>
          <header>
            <div className="title">Network Error:</div>
            <div className="message">{e.message}</div>
          </header>
          <ErrorTable className="error-table">
            {e.extensions && e.extensions.code && (
              <React.Fragment>
                <ErrorRowLabel>Error code:</ErrorRowLabel>
                <ErrorRowData>{e.extensions.code}</ErrorRowData>
              </React.Fragment>
            )}
            {e.extensions &&
              e.extensions.exception &&
              e.extensions.exception.stacktrace && (
              <React.Fragment>
                <ErrorRowDataPre>
                  {e.extensions.exception.stacktrace.map(
                    (line: string, i: number) => <div key={i}>{line}</div>)}
                </ErrorRowDataPre>
              </React.Fragment>
            )}
          </ErrorTable>
        </ErrorItem>
      ))}
    </ErrorList>
  );
}

export function ErrorDisplay({ error }: { error: ApolloError }) {
  // TODO: networkError
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    return (
      <ErrorListDisplay errors={error.graphQLErrors} />
    );
  } else if (error.networkError) {
    const result = (error.networkError as any).result;
    if (result && result.errors) {
      return (
        <NetworkErrorsDisplay errors={result.errors} />
      );
    }
  }
  console.error('not handled by error display:', JSON.stringify(error, null, 2));
  return null;
}

export function ErrorDialog({ env }: { env: ViewContext}) {
  const clearError = () => {
    env.mutationError = null;
  };

  return (
    <Observer>
      {() => {
        if (env.mutationError) {
          return (
            <Dialog
              open={true}
              onClose={clearError}
              style={{ flex: 5, minWidth: '30rem' }}
            >
              <Dialog.Header hasClose={true}>Error</Dialog.Header>
              <Dialog.Body style={{ padding: 0, flex: 1 }}>
                <ErrorDisplay error={env.mutationError as ApolloError} />
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={clearError} >Close</Button>
              </Dialog.Footer>
            </Dialog>
          );
        }
        return null;
      }}
    </Observer>
  );
}
