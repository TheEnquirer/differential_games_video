import { Circle, Text } from '@motion-canvas/2d/lib/components';
import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { all } from '@motion-canvas/core/lib/flow';
import { Color, Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';
import { Particle } from '../components/flow';
import { Graph } from '../components/graph';

export default makeScene2D(function* (view) {
	const particle = createRef<Particle>();
	const graph = createRef<Graph>();

	view.add(<>
		<Graph ref={graph} width={1200} height={600} graph_center={new Vector2(0, 0)} view_distance={5}>
			<Circle x={-3} width={1} height={1} fill="green" />
			<Circle x={-2} width={1} height={1} fill="green" />
			<Circle x={-1} width={1} height={1} fill="green" />
			<Circle x={0} width={1} height={1} fill="red" />
			<Circle x={1} width={1} height={1} fill="green" />
			<Circle x={2} width={1} height={1} fill="green" />
			<Circle x={3} width={1} height={1} fill="green" />
			<Circle x={4} width={1} height={1} fill="blue" />

			{(() => {
				const particles = [];
				for (let x = -5; x <= 5; x++) {
					for (let y = -5; y <= 5; y++) {
						if (x === 0 && y === 0) continue;

						particles.push(<Particle
							position={new Vector2(x, y)}
							max_trail_length={20}
							color={new Color("#000").alpha(0.2)}
						/>);
					}
				}

				return particles;
			})()}

			<Particle ref={particle} position={Vector2.zero} max_trail_length={20} color="#ffbc03">
				<Text x={1.5} fontSize={0.8}> Whee! </Text>
			</Particle>
		</Graph>
	</>);

	yield* Particle.animateDescendants(
		graph(),
		{
			frame_step: 0.1,
			frames: 60,
			sub_steps: 1,
		},
		({ x, y }) => x - y,
	);

	yield* all(
		graph().graph_center(particle().position(), 0.5),
		graph().view_distance(10, 0.5),
	);
	graph().graph_center(() => particle().position());

	yield* all(
		(function* () {
			yield* graph().view_distance(5, 1);
		})(),
		(function* () {
			const text = <Text opacity={0} y={-400}> Live "Whee!" Convoy Camera</Text>;
			view.add(text);
			yield* text.opacity(1, 1);
		})(),
		Particle.animateDescendants(
			graph(),
			{
				frame_step: 0.1,
				frames: 60,
				sub_steps: 1,
			},
			({ x, y }) => x - y,
		),
	)
});
