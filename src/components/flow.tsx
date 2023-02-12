import { Node, NodeProps } from "@motion-canvas/2d/lib/components";
import { colorSignal, initial, signal } from "@motion-canvas/2d/lib/decorators";
import { Color, ColorSignal, PossibleColor, Vector2, Vector2Signal } from "@motion-canvas/core/lib/types";

export type DerivativeFunc = (pos: Vector2) => number;

export interface ParticleProps extends NodeProps {
	readonly max_trail_length?: number;
	readonly trail_color?: PossibleColor;
}

export class Particle extends Node {
	// FIXME: This is a bug with VSCode's IntelliSense. Figure out why this is happening
	// and remove this ugly hack.
	public declare readonly position: Vector2Signal<this>;

	@initial(new Color("#000"))
	@colorSignal()
	public declare readonly trail_color: ColorSignal<this>;

	private readonly trail: Trail;

	constructor(props: ParticleProps) {
		super(props);
		this.trail = new Trail(props.max_trail_length);
	}

	protected override draw(context: CanvasRenderingContext2D): void {
		const { trail, position } = this;
		const { x, y } = position();

		// Undo duplicated transform
		context.save();
		context.translate(-x, -y);

		// Draw trail
		context.beginPath();
		context.strokeStyle = this.trail_color().css();
		context.globalAlpha = this.trail_color().alpha();
		context.lineWidth = 0.1;

		let first = true;
		for (const i of trail.iterIndices()) {
			context[(first ? "moveTo" : "lineTo")](trail.positions_x[i], trail.positions_y[i]);
			first = false;
		}

		context.stroke();

		// Draw particle
		context.globalAlpha = 1;
		context.fillStyle = this.trail_color().css();

		context.beginPath();
		context.arc(x, y, 0.2, 0, 2 * Math.PI);
		context.fill();

		// Restore context
		context.restore();

		// Render children
		super.draw(context);
	}

	recordTrail() {
		const { x, y } = this.position();
		this.trail.push(x, y);
	}

	moveBy(delta: Vector2) {
		this.recordTrail();
		this.moveByNoTrail(delta);
	}

	moveByNoTrail(delta: Vector2) {
		this.position(this.position().add(delta));
	}

	simulate(step: number, sub_steps: number, derivative: DerivativeFunc) {
		step = step / sub_steps;

		for (let i = 0; i < sub_steps; i++) {
			this.moveByNoTrail(new Vector2(1, derivative(this.position())).scale(step));
		}

		this.recordTrail();
	}
}

class Trail {
	private readonly positions_x_: number[] = [];
	private readonly positions_y_: number[] = [];
	private head = 0;

	constructor(public readonly max_length: number = 100) { }

	get positions_x(): readonly number[] {
		return this.positions_x_;
	}

	get positions_y(): readonly number[] {
		return this.positions_y_;
	}

	get length(): number {
		return this.positions_x_.length;
	}

	push(x: number, y: number) {
		this.positions_x_[this.head] = x;
		this.positions_y_[this.head] = y;
		this.head += 1;
		if (this.head >= this.max_length) {
			this.head = 0;
		}
	}

	*iterIndices(): IterableIterator<number> {
		// Recall: head is not yet overwritten so it's okay to logically begin iteration at the head.
		for (let i = this.head; i < this.length; i++) {
			yield i;
		}

		for (let i = 0; i < this.head; i++) {
			yield i;
		}
	}
}
