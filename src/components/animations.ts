import { useScene2D } from '@motion-canvas/2d';
import { Node, Shape } from '@motion-canvas/2d/lib/components';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { easeInCubic, easeOutElastic, easeOutExpo, TimingFunction } from '@motion-canvas/core/lib/tweening';
import { Vector2 } from "@motion-canvas/core/lib/types";

export type NodeAnimator<T> = (target: T) => ThreadGenerator;

export function animateSpawn<T extends Node>(parent: Node, target: T, animator: NodeAnimator<T>) {
	parent.add(target);
	return animator(target);
}

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

function getVerticalDistanceToOcclude(target: Node): number {
	return useScene2D().getSize().y / 2 + target.cacheRect().height + 250;
}

export function dropOut(duration: number) {
	return function* (target: Node) {
		yield* target.position(new Vector2(target.position().x, getVerticalDistanceToOcclude(target)), duration, easeInCubic);
		target.remove();
	}
}

export function dropIn(duration: number) {
	return function* (target: Node) {
		const old_pos = target.position();

		target.position(new Vector2(0, -getVerticalDistanceToOcclude(target)));
		yield* target.position(old_pos, duration, easeOutElastic);
	}
}

export function growIn(duration: number = 1, tween: TimingFunction = easeOutExpo) {
	return function* (target: Node) {
		const old_scale = target.scale();

		target.scale(Vector2.zero);
		yield* target.scale(old_scale, duration, tween);
	}
}

export function growOutTo(delta: Vector2, duration: number, tween: TimingFunction = easeOutExpo) {
	return function* (target: Node) {
		yield target.position(target.position().add(delta), duration, tween);
		yield* growIn(duration, tween)(target);
	}
}
