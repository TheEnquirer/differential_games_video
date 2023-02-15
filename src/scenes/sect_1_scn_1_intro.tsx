import { makeScene2D } from "@motion-canvas/2d";
import { Text } from "@motion-canvas/2d/lib/components";
import { waitUntil } from "@motion-canvas/core/lib/flow";
import { easeOutCubic } from "@motion-canvas/core/lib/tweening";
import { createRef } from "@motion-canvas/core/lib/utils";
import { dropOut, slag } from "../components/animations";

export default makeScene2D(function* (view) {
	const main = createRef<Text>();

	view.add(<>
		<Text ref={main} fontSize={0}> We Solved The Game! </Text>
	</>);

	yield* waitUntil("start delay");
	yield* main().fontSize(100, 0.5, easeOutCubic);
	yield* waitUntil("we think");
	yield* slag(1)(main());

	yield* waitUntil("scene end");
	yield* dropOut(1)(main());
});
