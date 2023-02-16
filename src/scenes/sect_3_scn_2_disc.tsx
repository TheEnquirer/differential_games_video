import { makeScene2D } from "@motion-canvas/2d";
import { Circle, Text } from "@motion-canvas/2d/lib/components";
import { waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";
import { animateParticles, DEFAULT_PARTICLE_CONFIG, functionalSimulator, Particle } from "../components/flow";
import { animateSpawn, dropOut, growIn, growOutTo, slag, un_slag } from "../components/animations";
import { Graph } from "../components/graph";
import { easeInElastic, easeInOutCubic } from "@motion-canvas/core/lib/tweening";

export default makeScene2D(function* (view) {
	yield* waitUntil("scene start");

	const graph = createRef<Graph>();
	const particle_1 = createRef<Particle>();
	const particle_2 = createRef<Particle>();
	const confusion_text = createRef<Text>();

	yield* animateSpawn(
		view,
		<Graph ref={graph} width={1000} height={1000}>
			<Circle x={0} y={0} stroke={"black"} lineWidth={0.1} size={new Vector2(1)} />
			<Particle ref={particle_1} x={-11} y={0} max_trail_length={200} color="red" />
			<Particle ref={particle_2} x={-14} y={0} max_trail_length={200} color="green">
				<Text x={1.2} y={-0.5} fontSize={0.6} fill="green"> Whee! </Text>
			</Particle>
		</Graph>,
		growIn(),
	);

	yield* waitUntil("particle start");
	yield animateParticles([particle_1()], functionalSimulator(x => 0), 11, 5);
	yield* waitFor(5);

	yield* waitUntil("where to");
	yield* animateSpawn(
		particle_1(),
		<Text ref={confusion_text} scale={new Vector2(0.02)} x={1} y={-0.3} fill="red"> ??? </Text>,
		growIn(),
	);

	yield* waitUntil("it could be zero");

	yield confusion_text().scale(0, 1, easeInElastic);
	yield animateParticles(
		[particle_1()],
		functionalSimulator(x => 0),
		10, 4,
		DEFAULT_PARTICLE_CONFIG,
		easeInOutCubic,
	);

	yield* waitUntil("it could be 20");
	yield animateParticles(
		[particle_2()],
		functionalSimulator(x => x > 0 ? -5 : 0),
		24, 2,
		DEFAULT_PARTICLE_CONFIG,
		easeInOutCubic,
	);

	yield* waitUntil("choose it");
	yield* animateSpawn(
		graph().container(),
		<Text fontSize={1}> Choose-your-own-derivative-free point (TM) </Text>,
		growOutTo(new Vector2(0, 1.3), 1),
	);

	yield* waitUntil("if illegal");
	yield* slag(1, 100)(graph());

	yield* waitUntil("best choice");
	yield* un_slag(1, 100)(graph());

	yield* waitUntil("scene end");
	yield* dropOut(1)(graph());
});
