import { styled, ThemeProps } from '../style';

export const Card = styled.section`
  align-items: stretch;
  background-color: ${(props: ThemeProps) => props.theme.cardBgColor};
  border: 1px solid ${(props: ThemeProps) => props.theme.cardBorderColor};
  box-shadow: 0px 2px 3px 0 ${(props: ThemeProps) => props.theme.cardShadowColor};
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  > header, footer {
    align-items: center;
    background-color: ${(props: ThemeProps) => props.theme.cardHeaderBgColor};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    min-height: 32px;
    padding: 4px 4px 4px 12px;
  }

  > header {
    border-bottom: 1px solid ${(props: ThemeProps) => props.theme.cardHeaderDividerColor};
    box-shadow: 0px 2px 2px 0 ${(props: ThemeProps) => props.theme.cardShadowColor};
    font-weight: bold;
  }

  > footer {
    border-top: 1px solid ${(props: ThemeProps) => props.theme.cardHeaderDividerColor};
  }
`;
