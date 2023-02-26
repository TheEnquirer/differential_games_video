import { makeProject } from '@motion-canvas/core/lib';

import sect_1_scn_1_intro from './scenes/sect_1_scn_1_intro?scene';
import sect_1_scn_2_rules from './scenes/sect_1_scn_2_rules?scene';
import sect_2_scn_1_intro from './scenes/sect_2_scn_1_intro?scene';
import sect_2_scn_2_broken from './scenes/sect_2_scn_2_broken?scene';
import sect_3_scn_1_reason from './scenes/sect_3_scn_1_reason?scene';
import sect_3_scn_2_disc from './scenes/sect_3_scn_2_disc?scene';
import sect_4_scn_1_squish from './scenes/sect_4_scn_1_squish?scene';
import sect_5_scn_1_alice_plan from './scenes/sect_5_scn_1_alice_plan?scene';
import sect_5_scn_2_bob_resp from './scenes/sect_5_scn_2_bob_resp?scene';
import sect_5_scn_3_lol_no from './scenes/sect_5_scn_3_lol_no?scene';

export default makeProject({
	name: "Differential Game",
	scenes: [
		sect_1_scn_1_intro,
		sect_1_scn_2_rules,
		sect_2_scn_1_intro,
		sect_2_scn_2_broken,
		sect_3_scn_1_reason,
		sect_3_scn_2_disc,
		sect_4_scn_1_squish,
		sect_5_scn_1_alice_plan,
		sect_5_scn_2_bob_resp,
		sect_5_scn_3_lol_no,
	],
	background: '#ece6e2',
});
