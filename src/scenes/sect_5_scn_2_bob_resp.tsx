import { makeScene2D } from "@motion-canvas/2d";
import { Node, Rect, Latex, Text, Circle } from "@motion-canvas/2d/lib/components";
import { waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { easeInExpo, easeInOutCubic, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, dropOut, growIn, growOutTo } from "../components/animations";
import { Bob } from "../components/characters";
import { animateParticles, DEFAULT_PARTICLE_CONFIG, differentialSimulator, Particle } from "../components/flow";

export default makeScene2D(function* (view) {
	const title = createRef<Text>();
	const bob = createRef<Bob>();
	const shrink_fx = createRef<Latex>();
	const eq_1 = createRef<Latex>();
	const eq_2 = createRef<Latex>();
	const eq_3 = createRef<Latex>();
	const eq_4 = createRef<Latex>();

	// What can Bob do?
	view.add(
		<>
			<Text ref={title} fontSize={110} y={-400} x={-40}> What can Bob do? </Text>
			<Bob ref={bob} scale={1.5} y={300} />
		</>
	);

	// Shrink f(x)?
	yield* waitUntil("shrink f(x)?");
	yield* animateSpawn(
		view,
		<Latex ref={shrink_fx} y={-100} x={-10} scale={7} tex="\text{Shrink } f(x)?"> </Latex>,
		growIn(),
	);

	// Elaboration
	yield* waitUntil("elaboration");
	yield title().position(title().position().addY(-250), 1, easeOutExpo);
	yield shrink_fx().position(shrink_fx().position().addY(-300), 1, easeOutExpo);
	yield shrink_fx().scale(6, 1, easeOutExpo);
	yield bob().position(bob().position().addY(450), 1, easeOutExpo);
	yield bob().scale(1.5, 1, easeOutExpo);

	yield* animateSpawn(
		view,
		<Latex
			ref={eq_1}
			tex="\frac{dy}{dx} = \frac{\color{red}f(x) - \lambda y}{\frac12(x-4)^2}"
			scale={4}
			y={-150}
		/>,
		growIn(),
	);

	yield* waitUntil("elaboration 2");
	yield* animateSpawn(
		view,
		<Latex
			ref={eq_2}
			position={eq_1().position()}
			tex="f(4) - \lambda y = 0"
			scale={5}
		/>,
		growOutTo(new Vector2(0, 250), 1),
	);

	yield* waitUntil("elaboration 3");
	yield* animateSpawn(
		view,
		<Latex
			ref={eq_3}
			position={eq_2().position()}
			tex="f(4) = \lambda y"
			scale={6}
		/>,
		growOutTo(new Vector2(0, 250), 1),
	);

	yield* waitUntil("elaboration 4");
	yield dropOut(1)(eq_1());
	yield dropOut(1)(eq_2());
	yield* eq_3().position(new Vector2(-400, -150), 1, easeInOutCubic);
	yield* animateSpawn(
		view,
		<Latex
			ref={eq_4}
			position={new Vector2(0, -150)}
			tex="y = \color{red}\text{???}"
			scale={6}
		/>,
		growOutTo(new Vector2(400, 0), 1),
	);

	// Bob's secret weapon...?
	const board = createRef<Graph>();
	const line_layer = createRef<Node>();
	const accept_layer = createRef<Node>();
	const exception = createRef<Circle>();

	yield* waitUntil("bob's weapon");
	yield shrink_fx().position(shrink_fx().position().addY(-300), 1, easeOutExpo);
	yield eq_3().position(eq_3().position().addY(-250), 1, easeOutExpo);
	yield eq_4().position(eq_4().position().addY(-250), 1, easeOutExpo);
	yield animateSpawn(
		view,
		<Graph
			ref={board}
			y={100}
			width={750}
			height={750}
		>
			<Node ref={line_layer}>
				<Rect x={0} y={0} width={0.1} height={100} fill="black" />
				<Rect x={0} y={0} width={100} height={0.1} fill="black" />
				<Rect x={4} y={0} width={0.1} height={100} fill="red" />
			</Node>
			<Node ref={accept_layer}>
				{[4, 3, 5, 7, 1, -2].map(v => <Particle
					x={-10}
					y={-v - 3}
					max_trail_length={200}
					color={v === 4 ? "blue" : "darkblue"}
				/>)}
				<Circle ref={exception} x={4} y={-4} width={0.5} height={0.5} fill="darkred" />
			</Node>
		</Graph>,
		growIn(),
	);

	eq_4().tex(() => `y = \\color{darkred}\\text{${-Math.round((4 + accept_layer().position().y) * 100) / 100}}`);

	for (const particle of accept_layer().children()) {
		if (!(particle instanceof Particle)) continue;

		const ty = particle.position().y + 3;
		yield animateParticles(
			particle,
			differentialSimulator(({ x, y }) => - (y - ty) / 2),
			(Math.abs(ty - (-4)) < 0.1) ? 20 : 14,
			2,
			DEFAULT_PARTICLE_CONFIG,
			easeOutExpo,
		);
	}

	yield* waitFor(2);
	for (const particle of accept_layer().children()) {
		if (!(particle instanceof Particle)) continue;

		if (particle.position().x < 5) {
			yield animateSpawn(
				particle,
				<Circle width={0.75} height={0.75} lineWidth={0.1} stroke="black" />,
				growIn(),
			);
		}
	}

	// Move the points around
	yield* waitUntil("move around");
	yield* accept_layer().position(accept_layer().position().addY(-3), 2, easeInOutCubic);
	yield* accept_layer().position(accept_layer().position().addY(5), 2, easeInOutCubic);

	// Is this enough?
	yield* waitUntil("is this enough");
	yield board().scale(0.75, 1, easeOutExpo);
	yield* animateSpawn(
		view,
		<Node y={50}>
			<Text fontSize={140}>Is this enough?</Text>
		</Node>,
		growIn(),
	);

	yield* waitUntil("scene end");
});
