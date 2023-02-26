import { makeScene2D } from "@motion-canvas/2d";
import { Circle, Node, Rect, Text } from "@motion-canvas/2d/lib/components";
import { waitUntil } from "@motion-canvas/core/lib/flow";
import { createRef, useRandom } from "@motion-canvas/core/lib/utils";
import { easeInOutExpo, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Graph } from "../components/graph";
import { animateSpawn, dropOut, growIn, slag } from "../components/animations";
import { animateParticles, DEFAULT_PARTICLE_CONFIG, differentialSimulator, graphParticles, Particle } from "../components/flow";
import { DynCollection } from "../components/collection";
import { Vector2 } from "@motion-canvas/core/lib/types";

export default makeScene2D(function* (view) {
	// Lol no
	const lol_no = createRef<Text>();
	view.add(<Text ref={lol_no} fontSize={200}> lol no </Text>);

	yield* waitUntil("slag lol no");
	yield* slag(1)(lol_no());

	yield* waitUntil("consider this");
	yield* dropOut(1)(lol_no());
	lol_no().remove();

	// Consider this
	const board = createRef<Graph>();
	const line_layer = createRef<Node>();
	const point_layer = createRef<Node>();
	const bob_sln = createRef<Particle>();

	const bob_sim = differentialSimulator(({ x, y }) => (x + 20 * y) / (-x * x - 2 * x));

	yield animateSpawn(
		view,
		<Graph ref={board} width={750} height={750} graph_center={new Vector2(4, 0)}>
			<Node ref={line_layer}>
				<Rect x={0} y={0} width={0.1} height={100} fill="black" />
				<Rect x={0} y={0} width={100} height={0.1} fill="black" />
				<Rect x={4} y={0} width={0.1} height={100} fill="red" />
			</Node>
			<Particle
				ref={bob_sln}
				x={5}
				y={-2}
				max_trail_length={200}
				color="black"
			/>
			<Node ref={point_layer} />
			<Circle x={4} y={-4} width={0.5} height={0.5} fill="darkred" />
		</Graph>,
		growIn()
	);

	graphParticles(bob_sln(), bob_sim, 8);

	// ...any curve to the left of the asymptote
	yield* waitUntil("eventually hit");

	const bad_particles = new DynCollection<Particle>();
	let good_particle!: Particle;

	for (let y = -10; y <= 10; y++) {
		const particle = createRef<Particle>();
		point_layer().add(<Particle
			ref={particle}
			x={-10}
			y={y}
			max_trail_length={200}
			color={`hsla(${Math.floor((y + 10) / 20 * 360)}, 100%, 50%, 0.75)`}
		/>);

		if (y === -4) {
			good_particle = particle();
		} else {
			bad_particles.add(particle());
		}
	}

	const all_particles = new DynCollection<Particle>();
	all_particles.add(good_particle);
	all_particles.inherit(bad_particles);

	yield* animateParticles(
		all_particles,
		differentialSimulator(_ => 0),
		14, 4,
		DEFAULT_PARTICLE_CONFIG,
		easeInOutExpo,
	);

	// if it hits the asymptote
	yield* waitUntil("if it hits the asymptote");

	for (const particle of bad_particles) {
		yield animateSpawn(
			particle,
			<Circle width={0.75} height={0.75} lineWidth={0.1} stroke="black" />,
			growIn(),
		);
	}

	yield* waitUntil("combine them");
	for (const particle of bad_particles) {
		const dx = 1;
		const slope = -(particle.position().y + 2) / dx;

		yield animateParticles(
			particle,
			differentialSimulator(_ => slope),
			dx, 1,
			DEFAULT_PARTICLE_CONFIG,
			easeInOutExpo,
		);
	}

	yield* waitUntil("ruin bob's life");
	yield* animateParticles(
		bad_particles,
		bob_sim,
		7, 2,
		DEFAULT_PARTICLE_CONFIG,
		easeInOutExpo,
	);

	yield* waitUntil("reject bad");
	for (const particle of bad_particles) {
		yield (particle.children()[0] as Circle).lineWidth(0, 1, easeInOutExpo);
		yield particle.color(particle.color().alpha(0), 1, easeInOutExpo);
	}

	yield good_particle.color(good_particle.color().alpha(1), 1, easeInOutExpo);

	yield animateParticles(good_particle, bob_sim, 8, 2, DEFAULT_PARTICLE_CONFIG, easeInOutExpo);

	// The "solution"
	yield* waitUntil("the 'solution'");
	const new_particles = new DynCollection<Particle>();

	for (let y = -10; y <= 10; y++) {
		if (Math.abs(y + 4) < 3) continue;

		const particle = createRef<Particle>();
		point_layer().add(<Particle
			ref={particle}
			x={-7 + useRandom().nextFloat(-1, 0)}
			y={y}
			max_trail_length={200}
			color={`hsla(${Math.floor((y + 10) / 20 * 360)}, 100%, 50%, 0.75)`}
		/>);

		new_particles.add(particle());
	}

	yield animateParticles(
		new_particles,
		differentialSimulator(({ x: _, y }) => (y + 4) * (-0.3)),
		10,
		6,
		DEFAULT_PARTICLE_CONFIG,
		easeOutExpo,
	);

	// Hol' up
	yield* waitUntil("hold up");
	yield slag(1)(board());
	yield animateSpawn(
		view,
		<Text fontSize={140}> Hold up... </Text>,
		growIn(1, easeInOutExpo),
	);

	yield* waitUntil("scene end");
});
