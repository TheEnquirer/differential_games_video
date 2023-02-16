import { makeScene2D } from "@motion-canvas/2d";
import { Latex, Text } from "@motion-canvas/2d/lib/components";
import { all, chain, every, waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef, useProject, useRandom } from "@motion-canvas/core/lib/utils";
import { Graph } from "../components/graph";
import { animateSpawn, dropOut, growIn, growInFrom as growOutTo, slag } from "../components/animations";
import { animateParticles, animateParticlesRange, DEFAULT_PARTICLE_CONFIG, differentialSimulator, Particle } from "../components/flow";
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
	// TODO: Extract into its own simulation file.
	//  Give animation to a dedicated animation thread to avoid this hacky nonsense.
	const rng = useRandom();
	const is_seeking = useProject().playbackState() === PlaybackState.Seeking;

	for (let i = 0; i < 10; i++) {
		if (!is_seeking) {
			for (let j = 0; j < 50; j++) {
				const particle = <Particle x={rng.nextFloat(-15, 10)} y={rng.nextFloat(-10, 10)} max_trail_length={20} />;
				graph().container().add(particle);
				particle.moveToBottom();
			}
		}

		yield* animateParticles(
			graph(),
			differentialSimulator(({ x, y }) => {
				const d = (x - y) / Math.pow(x - 2, 2);
				return Math.max(Math.min(d, 10), -10);
			}),
			5, 1,
		);

		if (!is_seeking) {
			for (const child of graph().container().children()) {
				if (child instanceof Particle && child.position().x > 10 + child.max_trail_length) {
					child.remove();
				}
			}
		}

		if (i === 8) {
			yield dropOut(1)(graph());
		}
	}
});
