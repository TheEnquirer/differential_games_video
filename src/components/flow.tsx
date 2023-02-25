import { Node, NodeProps } from "@motion-canvas/2d/lib/components";
import { colorSignal, initial, signal } from "@motion-canvas/2d/lib/decorators";
import { all, any, every, run, waitFor } from "@motion-canvas/core/lib/flow";
import { SimpleSignal } from "@motion-canvas/core/lib/signals";
import { cancel, ThreadGenerator } from "@motion-canvas/core/lib/threading";
import { linear, TimingFunction, tween } from "@motion-canvas/core/lib/tweening";
import { Color, ColorSignal, PossibleColor, Rect, Vector2 } from "@motion-canvas/core/lib/types";
import { createRef, Reference, useRandom } from "@motion-canvas/core/lib/utils";
import { DynCollection, IntoDynCollection } from "./collection";

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

	get max_trail_length() {
		return this.trail.max_length;
	}

	private trail: Trail;

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

	resetTrail() {
		this.trail = new Trail(this.max_trail_length);
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

export type ParticleList = DynCollection<Particle>;

export type IntoParticleList = IntoDynCollection<Particle>;

export type ParticleSimulator = (particle: Particle, delta: number) => void;

export type ParticleSimulatorConfig = Readonly<{
	max_step_size: number,
	trail_node_every: number,
	push_start_to_trail: boolean,
}>;

export const DEFAULT_PARTICLE_CONFIG: ParticleSimulatorConfig = {
	max_step_size: 0.1,
	trail_node_every: 0.1,
	push_start_to_trail: true,
};

export const DEFAULT_PARTICLE_CONFIG_NO_TRAIL: ParticleSimulatorConfig = {
	max_step_size: DEFAULT_PARTICLE_CONFIG.max_step_size,
	trail_node_every: Infinity,
	push_start_to_trail: false,
};

export function* animateParticles(
	targets: IntoParticleList,
	simulator: ParticleSimulator,
	distance: number,
	seconds: number,
	config: ParticleSimulatorConfig = DEFAULT_PARTICLE_CONFIG,
	lerp: TimingFunction = linear,
) {
	const particles = DynCollection.from(Particle, targets);

	// Run the loop
	let last_dist = 0;
	let dist_since_trail = config.push_start_to_trail ?
		config.max_step_size :
		0;

	yield* tween(seconds, time => {
		// Figure out how much distance we should travel
		const curr_dist = lerp(time) * distance;

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

export function graphParticles(
	targets: IntoParticleList,
	simulator: ParticleSimulator,
	distance: number,
	config: ParticleSimulatorConfig = DEFAULT_PARTICLE_CONFIG,
) {
	animateParticles(targets, simulator, distance, 0, config).next();
}

export function warpParticles(
	targets: IntoParticleList,
	simulator: ParticleSimulator,
	distance: number,
	max_step_size = DEFAULT_PARTICLE_CONFIG.max_step_size,
) {
	graphParticles(targets, simulator, distance, {
		max_step_size,
		push_start_to_trail: false,
		trail_node_every: Infinity,
	});
}

export function* animateParticlesRange(
	targets: IntoParticleList,
	simulator: ParticleSimulator,
	range: number,
	seconds: number,
	config: ParticleSimulatorConfig = DEFAULT_PARTICLE_CONFIG,
	lerp: TimingFunction = linear,
) {
	warpParticles(targets, invertSimulator(simulator), range, config.max_step_size);
	yield* animateParticles(targets, simulator, range * 2, seconds, config, lerp);
}

export function graphParticlesRange(
	targets: IntoParticleList,
	simulator: ParticleSimulator,
	range: number,
	config: ParticleSimulatorConfig = DEFAULT_PARTICLE_CONFIG,
) {
	animateParticlesRange(targets, simulator, range, 0, config).next();
}

export function invertSimulator(sim: ParticleSimulator): ParticleSimulator {
	return (particle, delta) => sim(particle, -delta);
}

export function differentialSimulator(f: (pos: Vector2) => number): ParticleSimulator {
	return (particle, delta) => particle.moveDifferential(f, delta);
}

export function functionalSimulator(f: (x: number) => number): ParticleSimulator {
	return (particle, delta) => particle.moveFunctional(f, delta);
}

export function fieldSimulator(f: (pos: Vector2) => Vector2): ParticleSimulator {
	return (particle, delta) => particle.moveBy(f(particle.position()).scale(delta));
}

// === Flow Field === //

export type ParticleFlowConfig = Readonly<{
	container: Node,
	simulator: ParticleSimulator,
	dist_per_sec: number,
	duration: number,
	spawn_zone: Rect,
	spawn_count: number,
	additional_targets?: ParticleList,
	simulation_config?: ParticleSimulatorConfig,
	visible_zone?: Rect | number,
	particle_factory?: (ref: Reference<Particle>) => void,
}>

export function animateParticleField(config: ParticleFlowConfig) {
	// Decompose config
	let {
		container,
		simulator,
		dist_per_sec,
		duration,
		spawn_zone,
		spawn_count,
		additional_targets,
		simulation_config,
		visible_zone,
		particle_factory,
	} = config;

	additional_targets ??= DynCollection.from(Particle, container);
	simulation_config ??= DEFAULT_PARTICLE_CONFIG;
	const visible_zone_rect = visible_zone instanceof Rect ?
		visible_zone :
		spawn_zone.expand(visible_zone ?? 0);

	particle_factory ??= particle => {
		<Particle
			ref={particle}
			x={rng.nextFloat(spawn_zone.left, spawn_zone.right)}
			y={rng.nextFloat(spawn_zone.top, spawn_zone.bottom)}
		/>;
	}

	// Spawn an original batch
	const rng = useRandom();
	const managed = new DynCollection<Particle>();

	for (let i = 0; i < spawn_count; i++) {
		const particle = createRef<Particle>();
		particle_factory(particle);
		container.add(particle());
		managed.add(particle());
		particle().position(
			new Vector2(
				rng.nextFloat(spawn_zone.left, spawn_zone.right),
				rng.nextFloat(spawn_zone.top, spawn_zone.bottom),
			)
		);
	}

	// Simulate the batch
	const simulated = new DynCollection<Particle>();
	simulated.inherit(additional_targets);
	simulated.inherit(managed);

	return any(
		animateParticles(simulated, simulator, dist_per_sec * duration, duration, simulation_config),
		run(function* () {
			// Respawn invisible particles
			while (true) {
				// For every particle...
				for (const particle of managed) {
					// If it's still visible, ignore it.
					if (visible_zone_rect.includes(particle.position())) {
						continue;
					}

					// Otherwise, reset the trail.
					particle.resetTrail();

					// And move it to a random corner in the spawning zone.
					// N.B. `nextInt`'s upper bound is exclusive.
					const opposite_side = rng.nextInt(0, 2) === 0;

					if (rng.nextInt(0, 2) === 0) {
						// Spawn along the x axis
						particle.position(spawn_zone.topLeft.add(new Vector2(
							rng.nextFloat(0, spawn_zone.width),
							opposite_side ? spawn_zone.height : 0,
						)));
					} else {
						// Spawn on the y axis
						particle.position(spawn_zone.topLeft.add(new Vector2(
							opposite_side ? spawn_zone.width : 0,
							rng.nextFloat(0, spawn_zone.height),
						)));
					}
				}
				yield;
			}
		}),
	)
}
