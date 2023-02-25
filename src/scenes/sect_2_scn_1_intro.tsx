import { makeScene2D } from "@motion-canvas/2d";
import { Circle, Text, Rect } from "@motion-canvas/2d/lib/components";
import { waitUntil } from "@motion-canvas/core/lib/flow";
import { easeOutCubic, easeOutElastic, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, growIn } from "../components/animations";
import { animateParticles, animateParticlesRange, DEFAULT_PARTICLE_CONFIG, differentialSimulator, invertSimulator, Particle, ParticleSimulatorConfig } from "../components/flow";
import { Vector2 } from "@motion-canvas/core/lib/types";

export default makeScene2D(function* (view) {
	yield* waitUntil("start");

	// Show title
	const title = createRef<Text>();
	yield* animateSpawn(view, <Text ref={title} fontSize={100}> When are solutions non-unique? </Text>, growIn());

	// Show the theorem
	yield* waitUntil("neat theorem");

	const graph = createRef<Graph>();
	const config: ParticleSimulatorConfig = { ...DEFAULT_PARTICLE_CONFIG, max_step_size: 0.005 };
	const particle_1 = createRef<Particle>();
	const particle_2 = createRef<Particle>();

	yield animateSpawn(
		view,
		<Graph ref={graph} width={1000} height={800} y={80}>
			<Particle
				ref={particle_1}
				x={1} y={2}
				max_trail_length={500}
				tail_width={0.3}
				head_radius={0.4}
				color={"darkblue"}
				opacity={0}
			/>

			<Particle
				ref={particle_2}
				x={4} y={2}
				max_trail_length={200}
				tail_width={0.3}
				head_radius={0.4}
				color={"darkred"}
				opacity={0}
			/>
		</Graph>,
		growIn(),
	);
	yield title().scale(0.7, 1, easeOutExpo);
	yield* title().position(title().position().addY(-400), 1, easeOutExpo);

	particle_1().opacity(1);
	particle_2().opacity(1);
	yield animateParticlesRange([particle_1()], differentialSimulator(({ x, y }) => x - y), 13, 1, config);
	yield* animateParticlesRange([particle_2()], differentialSimulator(({ x, y }) => x - y), 10, 1, config);

	yield* waitUntil("non zero region");
	yield animateSpawn(
		graph().container(),
		<Circle x={8} y={7} size={new Vector2(1)} fill="darkgreen" />,
		growIn(1, easeOutElastic),
	);
	yield graph().view_distance(5, 1, easeOutExpo);
	yield* graph().graph_center(new Vector2(6.5, 7), 1, easeOutExpo);

	yield* waitUntil("demo");
	const particle_show = createRef<Particle>();
	graph().container().add(<Particle
		ref={particle_show}
		x={8} y={7}
		max_trail_length={200}
		tail_width={0.2}
		head_radius={0.3}
		color={"darkgreen"}
		opacity={1}
	/>);

	yield* animateParticles(
		[particle_show()],
		invertSimulator(differentialSimulator(({ x, y }) => x - y)),
		3, 3,
		config,
		easeOutCubic,
	);
	yield* animateSpawn(particle_show(), <Text x={1.5} fill="darkgreen" scale={new Vector2(0.04)}> ??? </Text>, growIn());

	yield* waitUntil("region");
	yield* animateSpawn(
		graph().container(),
		<Rect x={8} y={7} width={6} height={100} fill="rgba(255, 0, 0, 0.3)" stroke="red" lineWidth={0.1} />,
		growIn(),
	);
	yield animateSpawn(
		graph().container(),
		<Text x={8 - 0.15} y={11} scale={new Vector2(0.013)}> Region of Uniqueness </Text>,
		growIn(),
	);

	// Show its requirements
	yield* waitUntil("requirements");
	yield graph().scale(0.8, 1);
	yield* graph().position(graph().position().addX(-500), 1);

	yield* animateSpawn(
		view,
		<Text x={400} y={-200} fontSize={60}> ~ Theorem Conditions ~ </Text>,
		growIn(),
	);

	yield* waitUntil("req 1");
	yield* animateSpawn(
		view,
		<Text x={400} y={-100} fontSize={60}> &bull; Continuous </Text>,
		growIn(),
	);

	yield* waitUntil("req 2");
	yield* animateSpawn(
		view,
		<Text x={400} y={0} fontSize={60}> &bull; Continuous (Deluxe Edition) </Text>,
		growIn(),
	);

	yield* waitUntil("scene end");
});
