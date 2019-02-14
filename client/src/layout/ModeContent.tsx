import styled from 'styled-components';

/** Represents the main content panel for various modes. */
export const ModeContent = styled.section`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
`;

export const ModeContentHeader = styled.header`
  align-items: center;
  display: flex;
  margin-bottom: .7rem;
`;

export const ModeContentTitle = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
`;
