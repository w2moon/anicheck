<script lang="ts">
	import { onMount } from 'svelte';
	import { Game } from '$lib/game';

	let container: HTMLDivElement;
	let game: Game;

	onMount(() => {
		game = new Game();
		game.init(container);
	});
</script>

<div class="app" bind:this={container}></div>

<style>
	.app {
		width: 100vw;
		height: 100vh;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
