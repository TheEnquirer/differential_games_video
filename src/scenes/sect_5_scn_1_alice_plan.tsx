import { makeScene2D } from "@motion-canvas/2d";
import { Rect, Text } from "@motion-canvas/2d/lib/components";
import { waitUntil } from "@motion-canvas/core/lib/flow";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Alice, Bob } from "../components/characters";
import { Graph } from "../components/graph";
import { animateSpawn, growIn } from "../components/animations";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { easeOutExpo } from "@motion-canvas/core/lib/tweening";

export default makeScene2D(function* (view) {
	// Let's play a game!
	yield* waitUntil("scene start");

	const intro_text = createRef<Text>();
	yield* animateSpawn(
		view,
		<Text ref={intro_text} fontSize={120}>Let's play a game!</Text>,
		growIn(),
	);

	// Alice's plan
	yield* waitUntil("alice's plan");

	const alice = createRef<Rect>();
	yield intro_text().position(intro_text().position().addY(-450), 1, easeOutExpo);
	yield intro_text().scale(0.75, 1, easeOutExpo);
	yield* animateSpawn(
		view,
		<Alice ref={alice} scale={new Vector2(2)} />,
		growIn(),
	);

	// Show board
	yield* waitUntil("show board");
	const board = createRef<Graph>();

	yield animateSpawn(
		view,
		<Graph ref={board} width={750} height={750} />,
		growIn()
	);
	yield alice().position(alice().position().addX(-700), 1, easeOutExpo);
	yield* alice().scale(1.5, 1, easeOutExpo);

	// Factorable quadratic
	yield* waitUntil("factorable quadratic");
	// TODO

	yield* waitUntil("scene end");
});
