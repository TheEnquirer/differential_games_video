import { Circle } from '@motion-canvas/2d/lib/components';
import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';
import { Graph } from '../components/graph';

export default makeScene2D(function* (view) {
	const graph = createRef<Graph>();

	view.add(<>
		<Graph ref={graph} width={1200} height={900} graph_center={new Vector2(0, 0)} view_distance={5}>
			<Circle x={-3} width={1} height={1} fill="green" />
			<Circle x={-2} width={1} height={1} fill="green" />
			<Circle x={-1} width={1} height={1} fill="green" />
			<Circle x={0} width={1} height={1} fill="red" />
			<Circle x={1} width={1} height={1} fill="green" />
			<Circle x={2} width={1} height={1} fill="green" />
			<Circle x={3} width={1} height={1} fill="green" />
			<Circle x={4} width={1} height={1} fill="blue" />
		</Graph>
	</>);

	yield* graph().view_distance(20, 2);
	yield* graph().graph_center(new Vector2(4, 0), 2);
	yield* graph().view_distance(1, 2);
});
