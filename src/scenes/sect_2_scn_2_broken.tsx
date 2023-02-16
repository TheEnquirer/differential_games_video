import { makeScene2D } from "@motion-canvas/2d";
import { Latex, Text } from "@motion-canvas/2d/lib/components";
import { waitFor, waitUntil } from "@motion-canvas/core/lib/flow";
import { easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";
import { animateSpawn, dropOut, growIn, growInFrom as growOutTo, slag } from "../components/animations";

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

	yield* waitUntil("scene end");
});
