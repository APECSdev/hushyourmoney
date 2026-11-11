// web/tailwind.config.ts

import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
    theme: {
        extend: {
            fontFamily: {
                /* Oversized display faces (Unbounded variable 200..900). */
                display: ['Unbounded', 'ui-sans-serif', 'sans-serif'],

                /* Body text. */
                sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],

                /* Cypherpunk terminal accents / overlines / data. */
                mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
        },
    },
}
