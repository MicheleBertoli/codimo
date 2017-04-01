/**
 * @author Luciano Graziani @lgraziani2712
 * @license {@link http://www.opensource.org/licenses/mit-license.php|MIT License}
 *
 * @flow
 */
import React from 'react';
import { Application, Container } from 'pixi.js';


type Props = {
  component: Container,
  height: number,
  width: number,
};

export default class PixiWrapper extends React.Component {
  props: Props;
  app: Application;
  view: HTMLCanvasElement;

  componentDidMount() {
    const { component, width, height } = this.props;

    this.app = new Application(width, height, {
      backgroundColor: 0x2a2a2a,
      view: this.view,
    });

    this.app.stage.addChild(component);
  }
  render() {
    return <canvas ref={(view) => this.view = view} />;
  }
}