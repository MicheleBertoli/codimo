/**
 * @author Luciano Graziani @lgraziani2712
 *
 */
import 'babel-polyfill';

import { configure } from '@kadira/storybook';

const req = require.context('../src', true, /\.stories\.jsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
