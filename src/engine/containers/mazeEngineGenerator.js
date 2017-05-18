/**
 * @author Luciano Graziani @lgraziani2712
 * @license {@link http://www.opensource.org/licenses/mit-license.php|MIT License}
 *
 * @flow
 */
import { Container } from 'pixi.js';

import { ZERO, ONE } from 'constants/numbers';
import { type ActorsToActions } from 'blockly/executorGenerator';
import { MOVE_FORWARD, MOVE_RIGHT, MOVE_BACKWARD, MOVE_LEFT } from 'constants/actions';
import mazeGenerator, { type MazeData, type Maze } from 'engine/components/mazeGenerator';
import numberGenerator, {
  START_STATE,
  STOP_STATE,
  type NumberActor,
} from 'engine/components/numberGenerator';
import numericLineGenerator, {
  type NumericLineData,
  type NumericLine,
} from 'engine/components/numericLineGenerator';
import { MazePathError, MazeExitError, MazeWrongExitError } from 'engine/helpers/errors';
import { randomizeActorsConfig } from 'engine/helpers/randomConfigurations';

const numberHasLeftMazeConfig = (
  mazeData: MazeData,
  numericLineData: NumericLineData,
  numericLine: NumericLine,
  numbers: Array<NumberActor>,
) => async (number: NumberActor, numberIndex: number): Promise<void> => {
  const exitIdx = mazeData.exits.indexOf(number.position);

  if (exitIdx === -ONE) {
    throw new MazeExitError(numberIndex);
  }

  const exit = mazeData.exits[exitIdx];

  await numericLine.receiveNumberAtPosition(number, numericLineData.accesses[exitIdx]);

  if (exit !== number.finalPosition) {
    numbers.forEach(number => {
      number.beSad(START_STATE);
    });
    numericLine.beSad(START_STATE);

    throw new MazeWrongExitError(numberIndex);
  }

  numbers.forEach(number => {
    number.beHappy(START_STATE);
  });
  numericLine.beHappy(START_STATE);
};
/* eslint-disable camelcase */
const directions = {
  [MOVE_FORWARD]: [ZERO, -ONE],
  [MOVE_RIGHT]: [ONE, ZERO],
  [MOVE_BACKWARD]: [ZERO, ONE],
  [MOVE_LEFT]: [-ONE, ZERO],
};
const directionsToWalls = {
  [MOVE_FORWARD]: 'top',
  [MOVE_RIGHT]: 'right',
  [MOVE_BACKWARD]: 'bottom',
  [MOVE_LEFT]: 'left',
};
/* eslint-enable */

const excecuteSetOfInstructionsConfig = (
  mazeData: MazeData,
  mazeDataExits: Array<string>,
  numbers: Array<NumberActor>,
  numberHasLeft: (number: NumberActor, numberIndex: number) => Promise<void>,
  /**
   * This is the engine's main function. It will execute every instruction and
   * animate everything according to the result of each of one of them.
   *
   * @param {ActorsToActions} instructions  map of instructions
   * @return {Promise<void>}                it will finish or throw an exeption
   */
) => async (instructions: ActorsToActions): Promise<void> => {
  const errors = [];

  for (const [numberPosition, actions] of instructions) {
    const number = numbers[numberPosition];
    let lastInstruction;

    for (let j = 0; j < actions.length; j++) {
      const direction = actions[j];
      const oldPosition = number.position;
      const newPosition = oldPosition
                            .split(',')
                            .map((pos, i) => (parseInt(pos) + directions[direction][i]))
                            .join(',');
      const path = mazeData.path.get(oldPosition);

      lastInstruction = direction;

      if (!path || !path[directionsToWalls[direction]]) {
        errors.push(new MazePathError(numberPosition));
        break;
      }
      /**
       * What happend if the number is over an exit and it tries to go forward?
       * Since there will be an open wall, the engine will try to move it.
       * But it won't enter the numeric line, it will fall from the maze.
       * And we don't want that.
       *
       * So, we need to check if the number is at one exit and wants to go forward.
       */
      if (mazeDataExits.indexOf(oldPosition) !== -ONE && direction === MOVE_FORWARD) {
        /**
         * FIXME what if there are even more instructions?
         * We need to say something about that. Something like:
         * "your instructions contains more than the necessaries"
         */
        break;
      }
      await number.updatePosition(newPosition);
    }
    /**
     * The number not only needs to stop at the exit,
     * it also needs to move forward one more time.
     *
     * If isn't like that, then it didn't really leave
     * the maze, just it stood at the exit.
     */
    if (mazeDataExits.indexOf(number.position) !== -ONE || lastInstruction !== MOVE_FORWARD) {
      errors.push(new MazeExitError(numberPosition));
    }
    if (errors[numberPosition]) {
      continue;
    }
    try {
      await numberHasLeft(number, numberPosition);
    } catch (err) {
      errors.push(err);
    }
  }
  if (errors.length) {
    throw errors;
  }
};
const handleResetGameConfig = (
  randomizeActors: () => Array<number>,
  numbers: Array<NumberActor>,
  maze: Maze,
  actorsPositions: Array<[number, number]>,
  numericLine: NumericLine,
) => () => {
  const newActors = randomizeActors();

  numbers.forEach((number, idx) => {
    number.changeActor(newActors[actorsPositions[idx][1]]);
    number.view.setParent(maze.view);
    number.beHappy(STOP_STATE);
    number.beSad(STOP_STATE);
    number.resetPosition();
  });
  numericLine.beHappy(STOP_STATE);
  numericLine.beSad(STOP_STATE);
};

export type GameDifficulty = 'easy' | 'normal' | 'hard';
export type Engine = {|
  view: Container,
  excecuteSetOfInstructions(instructions: ActorsToActions): Promise<void>,
  handleResetGame(): void,
|};
export default function mazeEngineGenerator(
  mazeData: MazeData,
  numericLineData: NumericLineData,
  difficulty: GameDifficulty,
): Engine {
  const view = new Container();
  const numericLine = numericLineGenerator(
    numericLineData.statics,
    mazeData.size,
    mazeData.margin,
  );

  const maze = mazeGenerator(mazeData);
  const randomizeActors = randomizeActorsConfig(
    numericLineData.statics,
    numericLineData.accesses,
    difficulty,
  );
  const randomActors = randomizeActors();
  const numbers: Array<NumberActor> = mazeData.actorsPositions.map((actorPositions) => {
    const actor = numberGenerator(
      randomActors[actorPositions[1]],
      mazeData.accesses[actorPositions[0]],
      mazeData.exits[actorPositions[1]],
      mazeData.size,
      mazeData.margin,
    );

    maze.view.addChild(actor.view);

    return actor;
  });

  maze.view.y = numericLine.view.height - mazeData.margin;

  view.addChild(maze.view, numericLine.view);

  return {
    view,
    excecuteSetOfInstructions: excecuteSetOfInstructionsConfig(
      mazeData, mazeData.exits, numbers, numberHasLeftMazeConfig(mazeData, numericLineData, numericLine, numbers),
    ),
    handleResetGame: handleResetGameConfig(
      randomizeActors, numbers, maze, mazeData.actorsPositions, numericLine,
    ),
  };
}
