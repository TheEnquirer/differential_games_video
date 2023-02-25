import { makeScene2D } from "@motion-canvas/2d";
import { Text, Rect, Node, Latex, Circle } from "@motion-canvas/2d/lib/components";
import { chain, run, waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { easeInExpo, easeInOutCubic, easeInOutExpo, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, dropOut, growIn, growInFromCorner as growRectInFromCorner, growOutTo } from "../components/animations";
import { animateParticles, DEFAULT_PARTICLE_CONFIG, differentialSimulator, Particle } from "../components/flow";

export default makeScene2D(function* (view) {
	const asymptotes_container = createRef<Node>();
	view.add(<Node ref={asymptotes_container} />);

	// Asymptotes not needed
	yield* waitUntil("scene start");
	yield* animateSpawn(
		asymptotes_container(),
		<Text fontSize={140}> Asymptotes </Text>,
		growIn(),
	);

	yield* waitUntil("not needed");
	yield* animateSpawn(
		asymptotes_container(),
		<Rect width={800} height={20} x={40} y={10} fill="red"></Rect>,
		growRectInFromCorner(new Vector2(-1, 0), 1),
	);

	// Show the equation
	yield* waitUntil("example eq");
	yield asymptotes_container().position(asymptotes_container().position().addY(-400), 1, easeOutExpo);
	yield asymptotes_container().scale(0.8, 1, easeOutExpo);
	yield* animateSpawn(
		view,
		<Latex scale={8} tex="\frac{dy}{dx} = x - y" y={-75} />,
		growIn(),
	);

	// Show the parameters
	yield* waitUntil("show parameters");
	yield animateSpawn(
		view,
		<Latex scale={5} tex="\color{red}\alpha = 1, \beta = 0, \gamma = 0 ~~~~ \color{green}\lambda = 1" />,
		growOutTo(new Vector2(0, 200), 1),
	);
	yield* animateSpawn(
		view,
		<Latex scale={5} tex="\color{blue}f(x) = x" />,
		growOutTo(new Vector2(0, 400 - 75), 1),
	);

	// Hide everything
	yield* waitUntil("show graph");
	for (const child of view.children()) {
		yield dropOut(1)(child);
	}
	yield* waitFor(1);

	// ..and show the graph
	const graph = createRef<Graph>();
	yield* animateSpawn(
		view,
		<Graph ref={graph} width={750} height={750} view_distance={5} />,
		growIn(),
	);

	// Spawn the points
	yield* waitUntil("spawn points");
	for (let x = -5; x <= 5; x++) {
		for (let y = -5; y <= 5; y++) {
			yield run(function* () {
				yield* waitFor((x + y + 10) * 0.05);
				yield* animateSpawn(
					graph().container(),
					<Particle x={x} y={y} max_trail_length={200} />,
					growIn(),
				);
			})
		}
	}

	// Animate the points
	yield* waitUntil("animate points");
	yield animateParticles(
		graph().container(),
		differentialSimulator(({ x, y }) => x - y),
		20, 5,
		DEFAULT_PARTICLE_CONFIG,
		easeInOutCubic,
	);

	yield* waitUntil("zoom out");
	yield graph().view_distance(10, 1, easeInOutExpo);
	yield graph().graph_center(new Vector2(10, 10), 1, easeInOutExpo);

	// Alice's solutions
	yield* waitUntil("alice solutions");
	const alice_sln = createRef<Circle>();
	yield* animateSpawn(
		graph().container(),
		<Circle ref={alice_sln} x={14} y={13} width={0.75} height={0.75} fill="red" />,
		growIn(),
	);

	yield* waitUntil("move alice around");
	yield* alice_sln().position(alice_sln().position().sub(new Vector2(5)), 2, easeInOutExpo);
	yield* alice_sln().position(alice_sln().position().add(new Vector2(10)), 2, easeInOutExpo);

	// Alice's second tool
	yield* waitUntil("alice tool two");
	yield graph().scale(0.75, 1, easeOutExpo);
	yield* animateSpawn(
		view,
		<Node y={50}>
			<Text fontSize={75} y={-100}>~ Strategy 2 ~</Text>
			<Text fontSize={100}>Squish everything down into a line!</Text>
		</Node>,
		growIn(),
	);

	yield* waitUntil("scene end");
	for (const child of view.children()) {
		yield dropOut(1)(child);
	}
	yield* waitFor(1);
});
