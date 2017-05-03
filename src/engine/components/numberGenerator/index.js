/**
 * @author Luciano Graziani @lgraziani2712
 * @license {@link http://www.opensource.org/licenses/mit-license.php|MIT License}
 *
 * @flow
 */
import { Text, TextStyle } from 'pixi.js';
import { TweenLite, Linear } from 'gsap';

import { HALF, ONE, ACTOR_MOVEMENT_DURATION } from 'constants/numbers';
import { UnableToLeaveTheNumericLine } from 'engine/helpers/errors';

const HEIGHT = 8;

const styleRaw = {
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fill: ['#ffffff', '#00ff99'], // gradient
  stroke: '#4a1850',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  // eslint-disable-next-line no-magic-numbers
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 2,
};

export type NumberActor = {|
  view: Text,
  position: string,
  hasEnteredToNumericLine(marginBottom: number): Promise<void>,
  resetPosition(): void,
  updatePosition(newPosition: string): Promise<void>,
|};
export type StaticNumberActor = {|
  view: Text,
|};

export const staticNumberGenerator = (number: number, size: number): StaticNumberActor => {
  const style = new TextStyle({
    ...styleRaw,
    fontSize: size / HALF + size / HEIGHT,
  });
  const view = new Text(number.toString(), style);

  view.anchor.x = view.anchor.y = 0.5;
  view.x = view.y = size / HALF;

  return {
    view,
  };
};

const hasEnteredToNumericLineConfig = (
  view: Text,
  size: number,
  /**
   * This function needs the number's scope. That's why is a named function.
   *
   * @param  {string} marginBottom margin between the numeric line block and the maze
   * @return {Promise<void>}       animation promise
   */
) => (function hasEnteredToNumericLine(marginBottom: number): Promise<void> {
  this.position = undefined;

  view.x = size / HALF;
  view.y = size + view.x + marginBottom;

  return new Promise((onComplete) => {
    TweenLite.to(view, ACTOR_MOVEMENT_DURATION, {
      y: size / HALF,
      ease: Linear.easeNone,
      onComplete,
    });
  });
});

const updatePositionConfig = (
  view: Text,
  size: number,
  /**
   * This function needs the number's scope. That's why is a named function.
   *
   * @param  {string} newPosition  to go
   * @return {Promise<void>}       animation promise
   */
) => (function updatePosition(newPosition: string): Promise<void> {
  if (!this.position) {
    throw new UnableToLeaveTheNumericLine();
  }
  this.position = newPosition;
  const positionNumbers = this.position.split(',').map((string: string): number => (parseInt(string)));

  return new Promise((onComplete) => {
    TweenLite.to(view, ACTOR_MOVEMENT_DURATION, {
      x: positionNumbers[0] * size + (size - view.width) / HALF - ONE,
      y: positionNumbers[1] * size + (size - view.height) / HALF + ONE,
      ease: Linear.easeNone,
      onComplete,
    });
  });
});
const resetPositionConfig = (
  view: Text,
  initialPosition: Array<number>,
  size: number,
) => (function resetPosition() {
  this.position = `${initialPosition[0]},${initialPosition[1]}`;

  view.x = initialPosition[0] * size + (size - view.width) / HALF - ONE;
  view.y = initialPosition[1] * size + (size - view.height) / HALF + ONE;
});

/**
 * This generator returns a new instance of NumberActor.
 *
 * TODO validate number is between valid range.
 * TODO valid position format.
 *
 * @param  {number} number   what number will be rendered. Valid values: [-99, 99].
 * @param  {string} position Follows the format 'x,y'.
 * @param  {number} size     The size of a block used as relative value
 * @return {NumberActor}     Used for animate a number
 */
const numberGenerator = (number: number, position: string, size: number): NumberActor => {
  const style = new TextStyle({
    ...styleRaw,
    fontSize: size / HALF + size / HEIGHT,
  });
  const view = new Text(number.toString(), style);
  const initialPosition = position.split(',').map((string: string): number => (parseInt(string)));

  view.x = initialPosition[0] * size + (size - view.width) / HALF - ONE;
  view.y = initialPosition[1] * size + (size - view.height) / HALF + ONE;

  return {
    view,
    position,
    resetPosition: resetPositionConfig(view, initialPosition, size),
    updatePosition: updatePositionConfig(view, size),
    hasEnteredToNumericLine: hasEnteredToNumericLineConfig(view, size),
  };
};

export default numberGenerator;