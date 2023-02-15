import { makeScene2D } from "@motion-canvas/2d";
import { Rect, Shape, Text } from "@motion-canvas/2d/lib/components";
import { all, waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, dropIn, growIn } from "../components/animations";
import { easeOutCubic, easeOutElastic, easeOutExpo } from "@motion-canvas/core/lib/tweening";

export default makeScene2D(function* (view) {
	// Rules text
	const rules = createRef<Text>();

	yield* animateSpawn(
		view,
		<Text ref={rules} y={-400} fontSize={120}> Rules </Text>,
		dropIn(1),
	);

	// Characters
	yield* waitUntil("the characters");

	const alice = createRef<Shape>();
	yield* animateSpawn(
		view,
		<Rect ref={alice} fill="red" x={-100} width={50} height={50}>
			<Text x={-10} y={100} fontStyle="center"> Alice </Text>
		</Rect>,
		growIn(1, easeOutExpo),
	);

	const bob = createRef<Shape>();
	yield* animateSpawn(
		view,
		<Rect ref={bob} fill="blue" x={100} width={50} height={50}>
			<Text x={-10} y={100} fontStyle="center"> Bob </Text>
		</Rect>,
		growIn(1, easeOutExpo),
	);

	// Game board
	const board = createRef<Graph>();

	yield* waitUntil("the board");
	yield* all(
		animateSpawn(
			view,
			<Graph ref={board} y={70} width={750} height={750} view_distance={10} />,
			growIn(1, easeOutExpo),
		),
		alice().position(alice().position().addX(-500), 1, easeOutExpo),
		bob().position(bob().position().addX(500), 1, easeOutExpo),
	);

	// Alice Equations
	// TODO

	yield* waitUntil("scene end");
});
