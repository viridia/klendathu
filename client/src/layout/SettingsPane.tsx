import { Card } from '../controls';
import { styled } from '../style';

export const SettingsPane = styled(Card)`
  flex: 1;

  > header {
    font-weight: normal;
    justify-content: flex-start;
  }
`;

export const SettingsPaneContent = styled.section`
  padding: 1rem;
`;
