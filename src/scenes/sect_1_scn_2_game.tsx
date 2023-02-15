import { makeScene2D } from "@motion-canvas/2d";
import { Latex, Rect, Node, Shape, Text } from "@motion-canvas/2d/lib/components";
import { chain, waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { createRef, useRandom } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, dropIn, dropOut, growIn } from "../components/animations";
import { easeInCubic, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { animateParticles, fieldSimulator, functionalSimulator, makeFunctionGraph, Particle } from "../components/flow";

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
	yield animateSpawn(
		view,
		<Graph ref={board} y={70} width={750} height={750} view_distance={15} />,
		growIn(1, easeOutExpo),
	);
	yield alice().position(alice().position().addX(-500), 1, easeOutExpo);
	yield* bob().position(bob().position().addX(500), 1, easeOutExpo);

	// Alice Equations
	yield* waitUntil("alice equations");
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

		// Make them disappear
		yield* waitUntil("bob equations");
		{
			for (const particle of particles) {
				yield animateParticles(
					[particle],
					fieldSimulator(() => Vector2.fromRadians(rng.nextFloat(0, 2 * Math.PI))),
					50,
					0.3,
				);
			}
		}
	}

	// Bob Equations
	yield animateSpawn(
		view,
		<Latex scale={new Vector2(4)} position={bob().position()} tex="f: \mathbb{R} \to \mathbb{R}" />,
		growIn(1, easeOutExpo),
	);
	yield* bob().position(bob().position().addY(300), 1, easeOutExpo);

	// Lambda
	yield* waitUntil("lambda");
	yield animateSpawn(
		view,
		<Latex tex="\lambda" scale={new Vector2(20)} />,
		growIn(1, easeOutExpo),
	);

	// Drop everything
	yield* waitUntil("scene end");
	for (const child of view.children()) {
		yield dropOut(1)(child);
	}

	yield* waitFor(1);
});
