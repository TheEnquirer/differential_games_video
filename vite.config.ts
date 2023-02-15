import { defineConfig } from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';
import checker from "vite-plugin-checker";

export default defineConfig({
	plugins: [motionCanvas(), checker({
		typescript: true,
	})],
});
