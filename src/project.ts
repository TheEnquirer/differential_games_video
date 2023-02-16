import { makeProject } from '@motion-canvas/core/lib';

import sect_1_scn_1_intro from './scenes/sect_1_scn_1_intro?scene';
import sect_1_scn_2_rules from './scenes/sect_1_scn_2_rules?scene';
import sect_2_scn_1_intro from './scenes/sect_2_scn_1_intro?scene';
import example from './scenes/example?scene';
import test_scene from './scenes/test_scene?scene';

export default makeProject({
	name: "Differential Game",
	scenes: [sect_1_scn_1_intro, sect_1_scn_2_rules, sect_2_scn_1_intro, example, test_scene],
	background: '#ece6e2',
});
