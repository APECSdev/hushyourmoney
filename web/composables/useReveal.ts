/* web/composables/useReveal.ts */

/* Scroll-reveal (shared composable): elements tagged .reveal fade/slide
   in when they enter the viewport. Unified threshold: 0.12. */
export const useReveal = () => {
    onMounted(() => {
        const io = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible')
                    io.unobserve(entry.target)
                }
            }
        }, { threshold: 0.12 })

        document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    })
}
