import { makeScene2D } from "@motion-canvas/2d";
import { Latex, Text } from "@motion-canvas/2d/lib/components";
import { all, chain, every, waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Rect, Vector2 } from "@motion-canvas/core/lib/types";
import { createRef, useProject, useRandom } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, dropOut, growIn, growOutTo as growOutTo, slag } from "../components/animations";
import { animateParticleField, animateParticles, animateParticlesRange, DEFAULT_PARTICLE_CONFIG, differentialSimulator, Particle } from "../components/flow";
import { PlaybackState } from "@motion-canvas/core";

export default makeScene2D(function* (view) {
	// Display jump-cut text
	const shock = createRef<Text>();
	view.add(<>
		<Text ref={shock} fontSize={70}> Unfortunately, our derivative functions suck.  </Text>
	</>);
	yield* waitFor(1);
	yield* slag(1)(shock());

	// Rearrangement
	yield* waitUntil("rearrangement");
	const original_eq = createRef<Latex>();
	const rearranged_eq = createRef<Latex>();

	yield animateSpawn(
		view,
		<Latex
			ref={original_eq}
			scale={new Vector2(5)}
			tex="\left(\alpha + \beta x + \gamma x^2\right)\frac{dy}{dx}+\lambda y=f(x)"
		/>,
		growIn(),
	);
	yield shock().scale(0, 1, easeOutExpo);

	yield* waitUntil("rearrange");
	yield original_eq().position(original_eq().position().addY(-300), 1, easeOutExpo);
	yield original_eq().scale(3.5, 1, easeOutExpo);
	yield animateSpawn(
		view,
		<Latex
			ref={rearranged_eq}
			scale={new Vector2(5)}
			tex="\frac{dy}{dx}=\frac{f(x)-\lambda y}{\alpha + \beta x + \gamma x^2}"
		/>,
		growIn(),
	);

	yield* waitUntil("alice plan");
	yield animateSpawn(
		view,
		<Latex
			scale={new Vector2(5)}
			position={rearranged_eq().position()}
			tex="\alpha + \beta x + \gamma x^2 = \color{red}{(x - 2)^2}"
		/>,
		growOutTo(new Vector2(0, 300), 1),
	);

	// Show the fishy graph
	yield* waitUntil("graph");

	for (const child of view.children()) {
		yield dropOut(1)(child);
	}
	yield* waitFor(1);

	const graph = createRef<Graph>();
	yield animateSpawn(
		view,
		<Graph ref={graph} width={1000} height={1000}>
			<Particle x={-11} y={8} max_trail_length={400} color="red" />
			<Particle x={-11.5} y={-4} max_trail_length={400} color="blue" />
			<Particle x={-12} y={0} max_trail_length={400} color="green" />
		</Graph>,
		growIn(),
	);

	// Animate those particles
	yield* animateParticleField({
		container: graph().container(),
		simulator: differentialSimulator(({ x, y }) => {
			const d = (x - y) / Math.pow(x - 2, 2);
			return Math.max(Math.min(d, 10), -10);  // Clamp the derivative to tame the graph
		}),
		dist_per_sec: 5,
		duration: 10,
		spawn_zone: new Rect(-10, -10, 20, 20),
		visible_zone: 5,
		spawn_count: 50,
		particle_factory(particle) {
			<Particle
				ref={particle}
				max_trail_length={10}
			/>;
		}
	});
});
