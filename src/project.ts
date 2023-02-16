import { makeProject } from '@motion-canvas/core/lib';

import sect_1_scn_1_intro from './scenes/sect_1_scn_1_intro?scene';
import sect_1_scn_2_rules from './scenes/sect_1_scn_2_rules?scene';
import sect_2_scn_1_intro from './scenes/sect_2_scn_1_intro?scene';
import sect_2_scn_2_broken from './scenes/sect_2_scn_2_broken?scene';

export default makeProject({
	name: "Differential Game",
	scenes: [
		sect_1_scn_1_intro,
		sect_1_scn_2_rules,
		sect_2_scn_1_intro,
		sect_2_scn_2_broken,
	],
	background: '#ece6e2',
});
