import { Grid, Rect, Node, RectProps, Circle } from "@motion-canvas/2d/lib/components";
import { initial, signal } from "@motion-canvas/2d/lib/decorators";
import { createSignal, SignalValue, SimpleSignal } from "@motion-canvas/core/lib/signals";
import { SimpleVector2Signal, Vector2 } from "@motion-canvas/core/lib/types";

export interface GraphProps extends RectProps {
	readonly graph_center?: SignalValue<Vector2>;
	readonly view_distance?: SignalValue<number>;
}

export class Graph extends Rect {
	@signal()
	public declare readonly graph_center: SimpleVector2Signal<this>;

	@initial(10)
	@signal()
	public declare readonly view_distance: SimpleSignal<number, this>;

	constructor(props: GraphProps) {
		super(props);

		// Apply default styling (N.B. this overrides whatever the user set!)
		this.clip(true);

		// The `super`-constructor adds the children to this node directly. We need to un-parent them
		// first before moving them into their actual container.
		this.removeChildren();

		// The scale-factor of everything in the graph w.r.t. the parent transform.
		const scale_factor = createSignal(() => {
			const { x, y } = this.size().scale(1 / (2 * this.view_distance() + 1));
			return Math.min(x, y);
		});

		// The spacing between lines on the grid.
		const spacing = createSignal(() => scale_factor());

		// Scaled center
		const scaled_center = createSignal(() => this.graph_center().scale(scale_factor()));

		this.add(<>
			<Grid
				stroke="#212121"
				spacing={spacing}
				position={() => {
					const { x, y } = scaled_center();
					return new Vector2(x % spacing(), y % spacing()).scale(-1);
				}}
				size={() => this.size().add(new Vector2(2 * spacing()))}
			/>
			<Node position={() => scaled_center().scale(-1)} scale={scale_factor}>
				{props.children}
			</Node>
		</>);
	}
}
