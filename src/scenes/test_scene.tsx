import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Node, Grid, Latex } from '@motion-canvas/2d/lib/components';
import { all } from '@motion-canvas/core/lib/flow';
import { createRef } from '@motion-canvas/core/lib/utils';
import { createSignal } from '@motion-canvas/core/lib/signals';

const RED = '#ff6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';

export default makeScene2D(function* (view) {
	const group = createRef<Node>();
	const scale = createSignal(1);
	const tex = createRef<Latex>();

	view.add(
		<Node ref={group} x={0}>
			<Grid
				width={1920}
				height={1920}
				spacing={() => scale() * 60}
				stroke={'#000000'}
				lineWidth={1}
				lineCap="square"
				cache
			/>
			<Latex
				ref={tex}
				tex="{\color{black} x = \sin \left( \frac{\pi}{2} \right)}"
				y={0}
				width={400} // height and width can calculate based on each other
			/>,
		</Node>,
	);

	yield* group().rotation(30, 0.8);
	yield* all(scale(2, 0.8), tex().scale(2, 0.8))
	yield* all(group().rotation(0, 0.8), scale(1, 0.8), tex().scale(1, 0.8));
});
