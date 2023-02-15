import { Circle } from '@motion-canvas/2d/lib/components';
import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { chain, waitFor } from '@motion-canvas/core/lib/flow';
import { easeOutBounce } from '@motion-canvas/core/lib/tweening';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';
import { Particle } from '../components/flow';
import { Graph } from '../components/graph';

export default makeScene2D(function* (view) {
	const graph = createRef<Graph>();

	const circles: [number, string][] = [
		[-3, "green"],
		[-2, "green"],
		[-1, "green"],
		[0, "red"],
		[1, "green"],
		[2, "green"],
		[3, "green"],
		[4, "blue"],
	]

	view.add(<>
		<Graph ref={graph} width={1200} height={600} graph_center={new Vector2(0, 0)} view_distance={5}>
			{circles.map(c =>
				<Circle x={c[0]} width={1} height={1} fill={c[1]} />
			)}
		</Graph>
	</>);

	const size = 5;

	for (let x = -size; x <= size; x++) {
		for (let y = -size; y <= size; y++) {
			const particle = createRef<Particle>();

			graph()
				.content_container()
				.add(<Particle ref={particle} x={x} y={y} head_radius={0} max_trail_length={20} color="#ffbc03" />);

			yield chain(
				waitFor(0.005 * (x + size) * (y + size)),
				particle().head_radius(0.2, 0.01, easeOutBounce),
			);
		}
	}

	yield* waitFor(1);

	yield* Particle.animateDescendants(
		graph(),
		{
			frame_step: 0.1,
			frames: 60,
			sub_steps: 1,
		},
		({ x, y }) => x - y,
	);
});
