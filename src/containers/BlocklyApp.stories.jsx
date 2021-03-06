/**
 * @author Luciano Graziani @lgraziani2712
 * @license {@link http://www.opensource.org/licenses/mit-license.php|MIT License}
 *
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import { storiesOf, action } from 'test/storybook-facades';
import { blocklyData } from 'test/gameMetadata';

import BlocklyApp from './BlocklyApp';

const newBlocklyData = {
  ...blocklyData,
  defaultElements: `
    <block type="move_forward">
      <next>
        <block type="move_right">
          <next>
            <block type="move_backward">
              <next>
                <block type="move_left" />
              </next>
            </block>
          </next>
        </block>
      </next>
    </block>
  `,
};
const handleClick = action('On play');
const handleSetOfInstructions = (rawInstructions) => (
  new Promise((resolve) => {
    handleClick(rawInstructions);
    resolve();
  })
);
const Container = styled.div`
  width: 500px;
`;

storiesOf('components.BlocklyApp', module)
    .add('simple Blockly app', () => (
      <Container>
        <BlocklyApp
          blocklyData={newBlocklyData}
          handleSetOfInstructions={handleSetOfInstructions}
          handleResetGame={() => {}}
        />
      </Container>
    ))
    .add('complex Blockly app', () => {
      const newestBlocklyData = {
        ...blocklyData,
        elements: [{
          define: 'category',
          name: 'Actions',
          blocks: blocklyData.elements,
        }, {
          define: 'category',
          name: 'Loops',
          blocks: [{
            define: 'block',
            type: 'simple_loop',
          }],
        }],
      };

      return (
        <Container>
          <BlocklyApp
            blocklyData={newestBlocklyData}
            handleSetOfInstructions={handleSetOfInstructions}
            handleResetGame={() => {}}
          />
        </Container>
      );
    });
