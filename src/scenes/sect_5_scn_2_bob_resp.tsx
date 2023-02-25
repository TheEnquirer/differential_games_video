import { makeScene2D } from "@motion-canvas/2d";
import { Latex, Text } from "@motion-canvas/2d/lib/components";
import { waitUntil } from "@motion-canvas/core/lib/flow";
import { easeInExpo, easeInOutCubic, easeOutExpo } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";
import { animateSpawn, dropOut, growIn, growOutTo } from "../components/animations";
import { Bob } from "../components/characters";

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

	// Bob's secret weapon
	// TODO

	yield* waitUntil("scene end");
});
