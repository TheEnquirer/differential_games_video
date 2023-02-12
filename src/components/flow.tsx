import { Node, NodeProps } from "@motion-canvas/2d/lib/components";
import { initial, signal } from "@motion-canvas/2d/lib/decorators";
import { createSignal, SignalValue, SimpleSignal } from "@motion-canvas/core/lib/signals";
import { Vector2, Vector2Signal } from "@motion-canvas/core/lib/types";

// === State === //

export type DerivativeFunc = (pos: Vector2) => number;

export class Particle {
	public readonly trail: Trail;
	public readonly position = Vector2.createSignal();

	constructor(starting: Vector2, max_trail_length?: number) {
		this.trail = new Trail(max_trail_length);
		this.position(starting);
	}

	moveByUntracked(delta: Vector2) {
		this.position(this.position().add(delta));
	}

	recordTrail() {
		const { x, y } = this.position();
		this.trail.push(x, y);
	}

	moveBy(delta: Vector2) {
		this.recordTrail();
		this.moveByUntracked(delta);
	}

	processOnce(step_size: number, derivative: DerivativeFunc, step_subdivision: number = 1) {
		this.recordTrail();
		const real_step_size = step_size / step_subdivision;
		for (let s = 0; s < step_subdivision; s++) {
			this.moveByUntracked(new Vector2(1, derivative(this.position())).scale(real_step_size));
		}
	}
}

export class Trail {
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

// === Renderer === //

export interface ParticleRendererProps extends NodeProps {
	readonly particle?: SignalValue<Particle>;
}

export class ParticleRenderer extends Node {
	// FIXME: This is a bug with VSCode's IntelliSense. Figure
	public declare readonly position: Vector2Signal<this>;

	@initial(null)
	@signal()
	public declare readonly particle: SimpleSignal<Particle | null>;

	constructor(props: ParticleRendererProps) {
		super(props);
		this.position(() => {
			const particle = this.particle();
			return particle !== null ?
				new Vector2(particle.position().x, particle.position().y) :
				Vector2.zero;
		});
	}

	protected override draw(context: CanvasRenderingContext2D): void {
		const particle = this.particle();

		if (particle !== null) {
			const { trail, position } = particle;
			const { x, y } = position();

			// Undo duplicated transform
			context.save();
			context.translate(-x, -y);

			// Draw trail
			context.beginPath();
			context.lineWidth = 0.1;

			let first = true;
			for (const i of trail.iterIndices()) {
				context[(first ? "moveTo" : "lineTo")](trail.positions_x[i], trail.positions_y[i]);
				first = false;
			}

			context.stroke();

			// Draw particle
			context.beginPath();
			context.arc(x, y, 0.2, 0, 2 * Math.PI);
			context.fill();

			// Restore context
			context.restore();
		}

		super.draw(context);
	}
}
