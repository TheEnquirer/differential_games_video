import { Node, Rect, RectProps, Text } from "@motion-canvas/2d/lib/components";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { Reference } from "@motion-canvas/core/lib/utils";

export interface AliceProps extends RectProps {

}

export class Alice extends Rect {
	constructor(props: AliceProps) {
		super(props);

		this.fill("red");
		this.size(new Vector2(50));
		this.add(<Text x={-10} y={100} fontStyle="center"> Alice </Text>);
	}
}

export class Bob extends Rect {
	constructor(props: AliceProps) {
		super(props);

		this.fill("blue");
		this.size(new Vector2(50));
		this.add(<Text x={-10} y={100} fontStyle="center"> Bob </Text>);
	}
}
