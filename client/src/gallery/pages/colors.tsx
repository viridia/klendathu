import * as React from 'react';
import { dye, styled, themeDefault } from '../../style';
import { register } from '../registry';

const Row = styled.section`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ColorGroup = styled.section`
  align-items: center;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  margin-right: 8px;
  padding: 8px;

  > header {
    margin-bottom: 8px;
  }
`;

const Swatch = styled.div`
  width: 10em;
  height: 24px;
  background-color: ${(props: { color: string }) => props.color};
`;

function Colors() {
  return (
    <React.Fragment>
      <header>Colors</header>
      <Row>
        <ColorGroup>
          <header>Primary</header>
          <Swatch color={dye(1.0, themeDefault.primaryColor)} />
          <Swatch color={dye(0.95, themeDefault.primaryColor)} />
          <Swatch color={dye(0.9, themeDefault.primaryColor)} />
          <Swatch color={dye(0.85, themeDefault.primaryColor)} />
          <Swatch color={dye(0.8, themeDefault.primaryColor)} />
          <Swatch color={dye(0.7, themeDefault.primaryColor)} />
          <Swatch color={dye(0.6, themeDefault.primaryColor)} />
          <Swatch color={dye(0.5, themeDefault.primaryColor)} />
          <Swatch color={dye(0.4, themeDefault.primaryColor)} />
          <Swatch color={dye(0.3, themeDefault.primaryColor)} />
          <Swatch color={dye(0.2, themeDefault.primaryColor)} />
          <Swatch color={dye(0.1, themeDefault.primaryColor)} />
          <Swatch color={dye(0.0, themeDefault.primaryColor)} />
        </ColorGroup>
        <ColorGroup>
          <header>Diluted</header>
          <Swatch color={dye(1.0, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.95, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.9, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.85, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.8, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.7, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.6, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.5, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.4, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.3, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.2, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.1, themeDefault.dilutedColor)} />
          <Swatch color={dye(0.0, themeDefault.dilutedColor)} />
        </ColorGroup>
      </Row>
    </React.Fragment>
  );
}

register('colors', Colors);
