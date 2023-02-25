import { Node } from "@motion-canvas/2d/lib/components";
import { SimpleSignal } from "@motion-canvas/core/lib/signals";

export type Class<T> = new (...args: any[]) => T;

export type IntoDynCollection<T> = DynCollection<T> | Node | readonly T[];

export class DynCollection<T> {
	private readonly particles = new Set<T>();
	private readonly inherits = new Set<Iterable<T>>();

	addFrom(clazz: Class<T>, target: Node) {
		const recursive = (part: Node) => {
			if (part instanceof clazz) {
				this.particles.add(part);
			}

			for (const child of part.children()) {
				recursive(child);
			}
		};

		recursive(target);
	}

	inherit(target: Iterable<T>) {
		this.inherits.add(target);
	}

	uninherit(target: Iterable<T>) {
		this.inherits.delete(target);
	}

	add(...particles: T[]) {
		for (const particle of particles) {
			this.particles.add(particle);
		}
	}

	remove(...particles: T[]) {
		for (const particle of particles) {
			this.particles.delete(particle);
		}
	}

	*[Symbol.iterator](): IterableIterator<T> {
		yield* this.particles;
		for (const inherited of this.inherits) {
			yield* inherited;
		}
	}

	static from<T>(clazz: Class<T>, v: IntoDynCollection<T>): DynCollection<T> {
		if (v instanceof DynCollection) {
			return v;
		} else if (v instanceof Node) {
			const list = new DynCollection<T>();
			list.addFrom(clazz, v);
			return list;
		} else {
			const list = new DynCollection<T>();
			list.add(...v);
			return list;
		}
	}
}
