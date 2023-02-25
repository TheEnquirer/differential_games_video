import { useScene2D } from '@motion-canvas/2d';
import { Node, Shape } from '@motion-canvas/2d/lib/components';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeInCubic, easeInOutExpo, easeOutElastic, easeOutExpo, linear, TimingFunction } from '@motion-canvas/core/lib/tweening';
import { Vector2, Rect } from "@motion-canvas/core/lib/types";

export type NodeAnimator<T> = (target: T) => ThreadGenerator;

// Combinators
export function animateSpawn<T extends Node>(parent: Node, target: T, animator: NodeAnimator<T>) {
	parent.add(target);
	return animator(target);
}

// Slag animations
export function slag(duration: number, drop_by: number = 30): NodeAnimator<Node> {
	return function* (target) {
		yield target.position(target.position().add(new Vector2(0, drop_by)), duration);
		yield* target.rotation(-5, duration);
	}
}

export function un_slag(duration: number, drop_by: number = 30): NodeAnimator<Node> {
	return function* (target) {
		yield target.position(target.position().add(new Vector2(0, -drop_by)), duration);
		yield* target.rotation(0, duration);
	}
}

// Drop animations
function getVerticalDistanceToOcclude(target: Node): number {
	return useScene2D().getSize().y / 2 + target.cacheRect().height + 250;
}

export function dropOut(duration: number): NodeAnimator<Node> {
	return function* (target: Node) {
		yield* target.position(new Vector2(target.position().x, getVerticalDistanceToOcclude(target)), duration, easeInCubic);
		target.remove();
	}
}

export function dropIn(duration: number): NodeAnimator<Node> {
	return function* (target: Node) {
		const old_pos = target.position();

		target.position(new Vector2(0, -getVerticalDistanceToOcclude(target)));
		yield* target.position(old_pos, duration, easeOutElastic);
	}
}

// Grow animations
export function growIn(duration: number = 1, tween: TimingFunction = easeOutExpo): NodeAnimator<Node> {
	return function* (target: Node) {
		const old_scale = target.scale();

		target.scale(Vector2.zero);
		yield* target.scale(old_scale, duration, tween);
	}
}

export function growOutTo(delta: Vector2, duration: number, tween: TimingFunction = easeOutExpo): NodeAnimator<Node> {
	return function* (target: Node) {
		yield target.position(target.position().add(delta), duration, tween);
		yield* growIn(duration, tween)(target);
	}
}

// Strikethrough animations
export function growInFromCorner(corner: Vector2, duration: number, tween: TimingFunction = easeInOutExpo): NodeAnimator<Shape> {
	return function* (target: Shape) {
		const original_pos = target.position();
		const original_size = target.size();
		target.position(target.position().add(target.size().div(new Vector2(2)).mul(corner)));
		target.size(0);

		yield target.position(original_pos, duration, tween);
		yield* target.size(original_size, duration, tween);
	}
}
