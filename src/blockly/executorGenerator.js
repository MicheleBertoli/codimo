/**
 * @author Luciano Graziani @lgraziani2712
 * @license {@link http://www.opensource.org/licenses/mit-license.php|MIT License}
 *
 * This tester must evaluate every component.
 *
 * @flow
 */

// FIXME This function need to be more generic
// Right now only works for one specific function
function componentExecutionConfig(blockName: string) {
  Blockly.JavaScript[blockName] = (block) => (`this.${blockName}(${block.number}, '${blockName}');`);
}

export type BlockExecutor = (...args: Array<*>) => void;
export type Executor = {
  addBlockExecutor(blockName: string, func: BlockExecutor): void,
  run(code: string): void,

  [blockName: string]: BlockExecutor,
};
/**
 * This object is responsible for executing the code-as-string generated by blockly.
 * It allows to add every function used by each block.
 *
 * @return {Object} excecutor
 */
const executorGenerator = () => ({
  addBlockExecutor(blockName: string, func: (...args: Array<*>) => void) {
    componentExecutionConfig(blockName);

    this[blockName] = func;
  },
  run: (code: string) => {
    eval(code);
  },
});

export default executorGenerator;
