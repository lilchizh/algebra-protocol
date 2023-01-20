/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'chart-menu-background': "grey",
				"primary": "#36f"
			},
			keyframes: {
				rotation: {
					'0%': { transform: 'rotate(0deg)'},
					'100%': { transform: 'rotate(360deg)'}
				}
			}
		},
	},
	plugins: [],
}
