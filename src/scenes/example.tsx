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
			<Particle ref={particle} position={Vector2.zero} max_trail_length={20} trail_color="#ffbc03">
				<Text x={1.5} fontSize={0.8}> Whee! </Text>
			</Particle>
		</Graph>
	</>);

	for (let i = 0; i < 70; i++) {
		particle().simulate(0.1, 1, ({ x, y }) => x - y);
		yield;
	}

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
			const text = <Text opacity={0} y={-400}> Live "Whee!" Camera</Text>;
			view.add(text);
			yield* text.opacity(1, 1);
		})(),
		(function* () {
			for (let i = 0; i < 60; i++) {
				particle().simulate(0.1, 1, ({ x, y }) => x - y);
				yield;
			}
		})(),
	)
});
