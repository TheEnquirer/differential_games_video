import { Node, NodeProps } from "@motion-canvas/2d/lib/components";
import { colorSignal, initial, signal } from "@motion-canvas/2d/lib/decorators";
import { SimpleSignal } from "@motion-canvas/core/lib/signals";
import { Color, ColorSignal, PossibleColor, Vector2, Vector2Signal } from "@motion-canvas/core/lib/types";

export type DerivativeFunc = (pos: Vector2) => number;

export interface ParticleProps extends NodeProps {
	readonly max_trail_length?: number;
	readonly color?: PossibleColor;
	readonly head_radius?: number;
	readonly tail_width?: number;
}

export type ParticleAnimateConfig = Readonly<{
	frames: number,
	frame_step: number,
	sub_steps: number,
	trail_every?: number,
}>;

export class Particle extends Node {
	// FIXME: This is a bug with VSCode's IntelliSense. Figure out why this is happening
	// and remove this ugly hack.
	public declare readonly position: Vector2Signal<this>;

	@initial(new Color("#000"))
	@colorSignal()
	public declare readonly color: ColorSignal<this>;

	@initial(0.2)
	@signal()
	public declare readonly head_radius: SimpleSignal<number, this>;

	@initial(0.1)
	@signal()
	public declare readonly tail_width: SimpleSignal<number, this>;

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
		if (this.tail_width() > 0) {
			context.beginPath();
			context.strokeStyle = this.color().css();
			context.globalAlpha = this.color().alpha();
			context.lineWidth = this.tail_width();

			let first = true;
			for (const i of trail.iterIndices()) {
				context[(first ? "moveTo" : "lineTo")](trail.positions_x[i], trail.positions_y[i]);
				first = false;
			}

			context.lineTo(x, y);
			context.stroke();
		}

		// Draw particle
		if (this.head_radius() > 0) {
			context.globalAlpha = 1;
			context.fillStyle = this.color().css();

			context.beginPath();
			context.arc(x, y, this.head_radius(), 0, 2 * Math.PI);
			context.fill();
		}

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

	simulate(step: number, sub_steps: number, derivative: DerivativeFunc, record_trail?: boolean) {
		step = step / sub_steps;

		for (let i = 0; i < sub_steps; i++) {
			this.moveByNoTrail(new Vector2(1, derivative(this.position())).scale(step));
		}

		if (record_trail) {
			this.recordTrail();
		}
	}

	static simulateDescendants(
		target: Node,
		step: number,
		sub_steps: number,
		derivative: DerivativeFunc,
		record_trail?: boolean,
	) {
		for (const child of target.children()) {
			if (child instanceof Particle) {
				child.simulate(step, sub_steps, derivative, record_trail);
			}

			Particle.simulateDescendants(child, step, sub_steps, derivative, record_trail);
		}
	}

	static *animateDescendants(
		target: Node,
		{
			frames,
			frame_step,
			sub_steps,
			trail_every,
		}: ParticleAnimateConfig,
		derivative: DerivativeFunc,
	) {
		trail_every ??= 1;

		for (let i = 0; i < frames; i++) {
			yield;
			Particle.simulateDescendants(target, frame_step, sub_steps, derivative, i % trail_every === 0);
		}
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
