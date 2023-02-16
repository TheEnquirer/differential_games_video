import { makeScene2D } from "@motion-canvas/2d";
import { Text } from "@motion-canvas/2d/lib/components";
import { waitFor } from "@motion-canvas/core/lib/flow";

export default makeScene2D(function* (view) {
	// This scene corresponds to:
	// How can we rationalize that given our theorem? Well, because of the asymptote, two requirements
	// of this theorem get broken. First, the derivative function is non-continuous because it just
	// isn’t defined at x = 2. Second, this isn’t even {continuous deluxe edition}. The rate at which
	// this curve yeets off into infinity just isn’t bounded, so the theorem can break down long
	// before it reaches the asymptote.
	view.add(<Text> TODO: Animate the asymptote stuff here. </Text>);
	yield* waitFor(10);
});
