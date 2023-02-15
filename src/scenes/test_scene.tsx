import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Node, Grid, Latex } from '@motion-canvas/2d/lib/components';
import { all } from '@motion-canvas/core/lib/flow';
import { createRef } from '@motion-canvas/core/lib/utils';
import { createSignal } from '@motion-canvas/core/lib/signals';
import { Graph } from '../components/graph';
import { Particle } from '../components/flow';
import { Circle } from '@motion-canvas/2d/lib/components';
import { Vector2 } from '@motion-canvas/core/lib/types';

const RED = '#ff6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';

export default makeScene2D(function* (view) {
	const group = createRef<Node>();
	const scale = createSignal(1);
	const tex = createRef<Latex>();
	const graph = createRef<Graph>();

	view.add(
		<Node ref={group} x={0}>
			<Graph ref={graph} width={1200} height={600} graph_center={new Vector2(0, 0)} view_distance={5}>
			</Graph>

			<Latex
				ref={tex}
				tex="{\color{black} x = \sin \left( \frac{\pi}{2} \right)}"
				y={0}
				width={400} // height and width can calculate based on each other
			/>,
		</Node>,
	);

	//yield* group().rotation(30, 0.8);
	yield* all(tex().scale(2, 0.8))
	//yield* all(group().rotation(0, 0.8), scale(1, 0.8), tex().scale(1, 0.8));
});
