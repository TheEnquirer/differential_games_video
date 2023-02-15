import { Node, NodeProps } from "@motion-canvas/2d/lib/components";
import { colorSignal, initial, signal } from "@motion-canvas/2d/lib/decorators";
import { SimpleSignal } from "@motion-canvas/core/lib/signals";
import { tween } from "@motion-canvas/core/lib/tweening";
import { Color, ColorSignal, PossibleColor, Vector2 } from "@motion-canvas/core/lib/types";

export interface ParticleProps extends NodeProps {
	readonly max_trail_length?: number;
	readonly color?: PossibleColor;
	readonly head_radius?: number;
	readonly tail_width?: number;
}

export class Particle extends Node {
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
		this.position(this.position().add(delta));
	}

	moveDifferential(f: (pos: Vector2) => number, delta: number) {
		this.moveBy(new Vector2(1, f(this.position())).scale(delta));
	}

	moveFunctional(f: (x: number) => number, delta: number) {
		const x = this.position().x + delta;
		this.position(new Vector2(x, f(x)));
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

// === Animation === //

export type ParticleSimulator = (particle: Particle, delta: number) => void;

export type ParticleConfig = Readonly<{
	max_step_size: number,
	trail_node_every: number,
	push_start_to_trail: boolean,
}>;

export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
	max_step_size: 0.1,
	trail_node_every: 0.1,
	push_start_to_trail: true,
};

export const DEFAULT_PARTICLE_CONFIG_NO_TRAIL: ParticleConfig = {
	max_step_size: DEFAULT_PARTICLE_CONFIG.max_step_size,
	trail_node_every: Infinity,
	push_start_to_trail: false,
};

export function* animateParticles(
	targets: Node | Particle[],
	simulator: ParticleSimulator,
	distance: number,
	seconds: number,
	config: ParticleConfig = DEFAULT_PARTICLE_CONFIG,
) {
	// Collect all relevant particles
	let particles: Particle[];

	if (targets instanceof Array) {
		particles = targets;
	} else {
		particles = [];

		const recursive = (part: Node) => {
			if (part instanceof Particle) {
				particles.push(part);
			}

			for (const child of part.children()) {
				recursive(child);
			}
		};

		recursive(targets);
	}

	// Run the loop
	let last_dist = 0;
	let dist_since_trail = config.push_start_to_trail ?
		config.max_step_size :
		0;

	yield* tween(seconds, time => {
		// Figure out how much distance we should travel
		const curr_dist = time * distance;

		// Compute the delta we need to traverse on this frame
		let remaining_delta = curr_dist - last_dist;
		last_dist = curr_dist;

		// While we still have some delta to go
		while (remaining_delta > 0) {
			// Take off at most `max_step_size` from it.
			const step_delta = Math.min(remaining_delta, config.max_step_size);
			remaining_delta -= step_delta;

			// Simulate every particle
			for (const particle of particles) {
				// Record the trail if we've gone too far.
				if (dist_since_trail >= config.trail_node_every) {
					particle.recordTrail();
				}
				simulator(particle, step_delta);
			}

			// Reset the trail distance accumulator if we just pushed one.
			if (dist_since_trail >= config.trail_node_every) {
				dist_since_trail = 0;
			}
			dist_since_trail += step_delta;
		}
	});
}

export function differentialSimulator(f: (pos: Vector2) => number): ParticleSimulator {
	return (particle, delta) => particle.moveDifferential(f, delta);
}

export function differentialSimulatorLeft(f: (pos: Vector2) => number): ParticleSimulator {
	return (particle, delta) => particle.moveDifferential(f, -delta);
}

export function functionalSimulator(f: (x: number) => number): ParticleSimulator {
	return (particle, delta) => particle.moveFunctional(f, delta);
}

export function fieldSimulator(f: (pos: Vector2) => Vector2): ParticleSimulator {
	return (particle, delta) => particle.moveBy(f(particle.position()).scale(delta));
}

export function makeFunctionGraph(
	f: (x: number) => number,
	start_x: number,
	end_x: number,
	config?: ParticleConfig,
): Particle {
	const particle = new Particle({
		x: start_x,
		y: f(start_x),
	});

	animateParticles(
		[particle],
		functionalSimulator(f),
		end_x - start_x,
		0,
		config,
	).next();
	return particle;
}
