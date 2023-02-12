import { makeProject } from '@motion-canvas/core/lib';

import example from './scenes/example?scene';
import test_scene from './scenes/test_scene?scene';

export default makeProject({
	scenes: [example, test_scene],
	background: '#ece6e2',
});
