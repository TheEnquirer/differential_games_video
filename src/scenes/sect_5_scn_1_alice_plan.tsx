import { makeScene2D } from "@motion-canvas/2d";
import { Node, Latex, Circle, Rect, Text } from "@motion-canvas/2d/lib/components";
import { waitUntil } from "@motion-canvas/core/lib/flow";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Alice, Bob } from "../components/characters";
import { Graph } from "../components/graph";
import { animateSpawn, growIn, growOutTo } from "../components/animations";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { easeInOutExpo, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { animateParticlesRange, DEFAULT_PARTICLE_CONFIG, differentialSimulator, functionalSimulator, Particle } from "../components/flow";

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
	const line_layer = createRef<Node>();
	const point_layer = createRef<Node>();

	yield animateSpawn(
		view,
		<Graph ref={board} width={750} height={750}>
			<Node ref={line_layer}>
				<Rect x={0} y={0} width={0.1} height={100} fill="black" />
				<Rect x={0} y={0} width={100} height={0.1} fill="black" />
			</Node>
			<Node ref={point_layer} />
		</Graph>,
		growIn()
	);
	yield alice().position(alice().position().addX(-700), 1, easeOutExpo);
	yield* alice().scale(1.5, 1, easeOutExpo);

	// Factorable quadratic
	yield* waitUntil("factorable quadratic");

	// Show equations
	yield animateSpawn(
		view,
		<Latex
			position={alice().position()}
			scale={3}
			tex="\alpha + \beta x + \gamma x ^ 2"
		/>,
		growOutTo(new Vector2(0, -150), 1),
	);
	yield animateSpawn(
		view,
		<Latex
			position={alice().position()}
			scale={4}
			tex="\color{red}\frac12 x^2 - 2x + 0"
		/>,
		growIn(),
	);
	yield alice().position(alice().position().addY(200), 1, easeOutExpo);

	// Show generated quadratic
	yield animateSpawn(
		point_layer(),
		<Circle x={4} width={0.5} height={0.5} fill="black" />,
		growIn(),
	);

	const alice_graph = createRef<Particle>();
	line_layer().add(<Particle ref={alice_graph} color="red" max_trail_length={300} x={4} />);
	yield* animateParticlesRange(
		alice_graph(),
		functionalSimulator(x => -(0.5 * x * x - 2 * x)),
		7,
		2,
		DEFAULT_PARTICLE_CONFIG,
		easeOutExpo,
	);

	// Collapse the quadratic into its asymptote
	yield* waitUntil("graph collapse");
	yield alice_graph().color(alice_graph().color().alpha(0), 1, easeOutExpo);
	yield animateSpawn(
		line_layer(),
		<Rect x={4} y={0} width={0.1} height={100} fill="red" />,
		growIn(),
	);

	// Put the points
	yield* waitUntil("puts the points");
	yield* board().graph_center(board().graph_center().addX(5), 1, easeInOutExpo);

	yield animateSpawn(
		point_layer(),
		<Circle x={13} width={0.5} height={0.5} fill="#fc0341" />,
		growIn(),
	);
	yield* animateSpawn(
		point_layer(),
		<Circle x={7} width={0.5} height={0.5} fill="#fc03c2" />,
		growIn(),
	);

	// Show the hope
	yield* waitUntil("alice's hope 1");

	const bob_sln = createRef<Particle>();
	line_layer().add(<Particle ref={bob_sln} x={-5} y={-5} max_trail_length={300} color="blue" />);
	yield* animateParticlesRange(
		bob_sln(),
		differentialSimulator(({ x: _, y }) => - y / 2),
		20,
		2,
		DEFAULT_PARTICLE_CONFIG,
		easeOutExpo,
	);

	yield* waitUntil("alice's hope 2");
	const alice_sln = createRef<Particle>();
	line_layer().add(<Particle ref={alice_sln} x={-5} y={5} max_trail_length={300} color="red" />);
	yield* animateParticlesRange(
		alice_sln(),
		differentialSimulator(({ x: _, y }) => - y / 2),
		20,
		2,
		DEFAULT_PARTICLE_CONFIG,
		easeOutExpo,
	);

	yield* waitUntil("scene end");
});
