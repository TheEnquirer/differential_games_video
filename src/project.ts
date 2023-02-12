import {makeProject} from '@motion-canvas/core/lib';

import example from './scenes/example?scene';
import testscene from './scenes/testscene?scene';

export default makeProject({
  scenes: [testscene],
  background: '#ece6e2',
});
