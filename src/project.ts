import { makeProject } from '@motion-canvas/core/lib';

import sect_1_scn_1_intro from './scenes/sect_1_scn_1_intro?scene';
import sect_1_scn_2_game from './scenes/sect_1_scn_2_game?scene';
import example from './scenes/example?scene';

export default makeProject({
	scenes: [sect_1_scn_1_intro, sect_1_scn_2_game, example],
	background: '#ece6e2',
});
