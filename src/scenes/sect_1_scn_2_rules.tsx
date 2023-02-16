import { makeScene2D } from "@motion-canvas/2d";
import { Latex, Rect, Node, Shape, Text, Circle } from "@motion-canvas/2d/lib/components";
import { chain, waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { createRef, useRandom } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, dropIn, dropOut, growIn } from "../components/animations";
import { easeInBounce, easeInExpo, easeInOutExpo, easeOutBounce, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { animateParticles, animateParticlesRange, DEFAULT_PARTICLE_CONFIG, DEFAULT_PARTICLE_CONFIG_NO_TRAIL, differentialSimulator, fieldSimulator, functionalSimulator, Particle } from "../components/flow";

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
		growIn(),
	);

	const bob = createRef<Shape>();
	yield* animateSpawn(
		view,
		<Rect ref={bob} fill="blue" x={100} width={50} height={50}>
			<Text x={-10} y={100} fontStyle="center"> Bob </Text>
		</Rect>,
		growIn(),
	);

	// Game board
	const board = createRef<Graph>();

	yield* waitUntil("the board");
	yield animateSpawn(
		view,
		<Graph ref={board} y={70} width={750} height={750} view_distance={15} />,
		growIn(),
	);
	yield alice().position(alice().position().addX(-500), 1, easeOutExpo);
	yield* bob().position(bob().position().addX(500), 1, easeOutExpo);

	// Main equation
	yield* waitUntil("main equation");

	const main_eq = createRef<Latex>();
	yield rules().position(rules().position().addY(-200), 1, easeOutExpo);
	yield animateSpawn(
		view,
		<Latex
			ref={main_eq}
			tex="\left(\alpha + \beta x + \gamma x^2\right)\frac{dy}{dx}+\lambda y=f(x)"
			y={-400}
			scale={new Vector2(4)}
		/>,
		growIn(),
	);

	// Alice Equations
	yield* waitUntil("alice equations");
	rules().remove();
	yield animateSpawn(
		view,
		<Node position={alice().position()}>
			<Latex scale={new Vector2(4)} tex="\alpha, \beta, \gamma \in \mathbb{R}" />,
			<Latex scale={new Vector2(2.5)} y={100} tex="\gamma x^2 + \beta x + \alpha" />,
		</Node>,
		growIn(1, easeOutExpo),
	);
	yield* alice().position(alice().position().addY(300), 1, easeOutExpo);

	yield* waitUntil("graph");
	{
		// Show graph contents
		const particles: Particle[] = [];
		const rng = useRandom();

		for (let i = 0; i < 10; i++) {
			const particle = createRef<Particle>();

			const cx = rng.nextFloat(-5, 5);
			const a = rng.nextFloat(-1, 1);
			const color = `hsl(${rng.nextInt(0, 360)}, 130%, 40%)`;
			const f = (x: number) => a * Math.pow((x - cx), 2);

			board().container().add(<Particle
				ref={particle}
				x={cx - 20}
				y={f(cx - 20)}
				head_radius={0.4}
				max_trail_length={500}
				tail_width={0.3}
				color={color}
			/>);

			yield chain(
				waitFor(useRandom().nextFloat(0.1, 0.5)),
				animateParticles([particle()], functionalSimulator(f), 40, 0.5),
			);

			particles.push(particle());
		}

		// Alice points
		yield* waitUntil("points");
		for (const particle of particles) {
			yield animateParticles(
				[particle],
				fieldSimulator(() => Vector2.fromRadians(rng.nextFloat(0, 2 * Math.PI))),
				50,
				0.3,
			);
		}

		yield animateSpawn(
			board().container(),
			<Circle x={6} y={5} size={new Vector2(1)} fill="red" />,
			growIn(1, easeOutBounce),
		);
		yield* animateSpawn(
			board().container(),
			<Circle x={-3} y={4} size={new Vector2(1)} fill="blue" />,
			growIn(1, easeOutBounce),
		);
	}

	// Bob Equations
	yield* waitUntil("bob equations");
	yield animateSpawn(
		view,
		<Latex scale={new Vector2(4)} position={bob().position()} tex="f: \mathbb{R} \to \mathbb{R}" />,
		growIn(),
	);
	yield* bob().position(bob().position().addY(300), 1, easeOutExpo);

	// Such that it passes
	yield* waitUntil("such that it passes");
	const max_step_size = 0.005;
	const func = differentialSimulator(({ x, y }: Vector2) => x - y);

	const bob_solution = createRef<Particle>();
	board().container().add(<Particle
		ref={bob_solution}
		x={1} y={2}
		max_trail_length={200}
		tail_width={0.3}
		head_radius={0.4}
		color={"darkblue"}
	/>);
	yield* animateParticlesRange(
		[bob_solution()], func, 10, 1,
		{ ...DEFAULT_PARTICLE_CONFIG, max_step_size },
	);

	yield* waitUntil("but is unique");
	const alice_solution = createRef<Particle>();
	board().container().add(<Particle
		ref={alice_solution}
		x={4} y={2}
		max_trail_length={200}
		tail_width={0.3}
		head_radius={0.4}
		color={"darkred"}
	/>);
	yield* animateParticlesRange(
		[alice_solution()], func, 10, 1,
		{ ...DEFAULT_PARTICLE_CONFIG, max_step_size },
	);

	// Drop everything and move the characters to the center
	yield* waitUntil("question");
	for (const child of view.children()) {
		if (child === alice() || child === bob()) {
			continue;
		}
		yield dropOut(1)(child);
	}

	yield alice().position(new Vector2(-300, 100), 2, easeInOutExpo);
	yield alice().scale(2, 2, easeInOutExpo);
	yield bob().position(new Vector2(300, 100), 2, easeInOutExpo);
	yield bob().scale(2, 2, easeInOutExpo);

	yield animateSpawn(view, <Text y={-300} fontSize={100}> Who wins? </Text>, growIn());

	yield* waitUntil("under what conditions");
	yield animateSpawn(view, <Text y={-150} fontSize={80}> When? </Text>, growIn());

	// Lambda
	yield* waitUntil("lambda");
	yield animateSpawn(
		view,
		<Latex tex="\lambda" scale={new Vector2(20)} y={100} />,
		growIn(),
	);

	yield* waitUntil("scene end");

	for (const child of view.children()) {
		yield dropOut(1)(child);
	}

	yield* waitFor(1);
});
