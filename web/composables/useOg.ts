/* web/composables/useOg.ts */

/* Shared OpenGraph/Twitter meta builder (user directive 2026-11-13: OG posters
   on ALL pages). Emits the full OG/Twitter tag set + a canonical link, with
   og:image pointing at a dedicated 2400x1260 poster under /posters/.
   Page-level values override the nuxt.config head globals (Nuxt dedupes meta). */
export const useOg = (opts: {
    title: string
    description: string
    path: string
    image: string
    type?: 'website' | 'article'
    imageAlt?: string
}) => {
    const BASE = 'https://hushyourmoney.com'
    const url = BASE + opts.path
    const img = BASE + opts.image
    const alt = opts.imageAlt ?? opts.title

    useHead({
        title: opts.title,
        link: [
            { rel: 'canonical', href: url },
        ],
        meta: [
            { name: 'description', content: opts.description },
            { property: 'og:type', content: opts.type ?? 'article' },
            { property: 'og:site_name', content: 'Hush Your Money' },
            { property: 'og:title', content: opts.title },
            { property: 'og:description', content: opts.description },
            { property: 'og:url', content: url },
            { property: 'og:image', content: img },
            { property: 'og:image:width', content: '2400' },
            { property: 'og:image:height', content: '1260' },
            { property: 'og:image:alt', content: alt },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: opts.title },
            { name: 'twitter:description', content: opts.description },
            { name: 'twitter:image', content: img },
        ],
    })
}
