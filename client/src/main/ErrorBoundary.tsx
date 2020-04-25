import React from 'react';
import styled from 'styled-components';

const ErrorPanel = styled.section`
  background-color: #000;
  color: #f66;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
`;

const ErrorHeader = styled.header`
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
`;

const ErrorRowDataPre = styled.div`
  /* grid-column: content; */
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 1.2rem;
`;

interface Props {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, { error: Error }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  public static getDerivedStateFromError(error: any) {
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.log(error);
    if (errorInfo) {
      console.warn(errorInfo);
    }
  }

  public render() {
    const { error } = this.state;
    if (error) {
      return (
        <ErrorPanel>
          <ErrorHeader>{error.name}</ErrorHeader>
          <ErrorRowDataPre>
            {error.stack}
          </ErrorRowDataPre>
        </ErrorPanel>
      );
    }
    return this.props.children;
  }
}
