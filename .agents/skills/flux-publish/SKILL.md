<!-- .agents/skills/flux-publish/SKILL.md -->
---
name: flux-publish
description: Build, smoke-test, and publish the HushYourMoney Nuxt 3 app to Flux Cloud via Docker Hub. Use when deploying or releasing hushyourmoney.com updates, when the user asks to "publish", "deploy", "push to Flux", or "release" the site, or after any committed source change that must go live.
---

# Flux Publish — HushYourMoney release runbook

This skill lives inside the repository it deploys. Run all commands from the repository root; the app is Nuxt 3 in `web/` and the production server runs `node .output/server/index.mjs` on container port `3000` (source: `web/Dockerfile`).

Deployment is **NOT** git-push-to-deploy. The live site is a Flux Cloud app that pulls the image `nyusternie/hushyourmoney:latest` from Docker Hub; the git push only keeps source and image in sync.

## Pipeline (run every step, in order)

1. **Commit source first.** `git add -A && git commit -m "<what changed>" && git push`. Never push an image built from uncommitted source (source/image sync rule).

2. **Build the image**:
   ```bash
   cd web && docker build -t nyusternie/hushyourmoney:latest .
   ```
   Add `--no-cache` when a new digest is required from unchanged source layers.

3. **Smoke test locally** — ALL three checks must pass before pushing (use a free host port; `3000` may be occupied):
   ```bash
   docker run --rm -d --name hym-smoke -p <HOST_PORT>:3000 nyusternie/hushyourmoney:latest
   sleep 10
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<HOST_PORT>/            # must be 200
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:<HOST_PORT>/api/wallet  # must be 200
   curl -s http://localhost:<HOST_PORT>/ | grep -c "Hush Your Money — Spend Privately. Fearlessly!"  # must be ≥1
   docker stop hym-smoke
   ```
   The title string is the release gate — verify byte-for-byte (em dash, exclamation point).

4. **Push the image**:
   ```bash
   docker push nyusternie/hushyourmoney:latest
   ```

5. **Verify the Hub digest changed**:
   ```bash
   curl -s https://hub.docker.com/v2/repositories/nyusternie/hushyourmoney/tags/latest | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['digest'], d['last_updated'])"
   ```
   Compare `digest` and `last_updated` against the values from before the push. Docker Hub tag-description PATCH is unsupported (HTTP 405) — tag metadata is push-generated only.

6. **Flux rollout.** Flux picks up the new digest automatically (typically within minutes; a hard redeploy is possible from the Flux dashboard at `https://cloud.runonflux.io`). Before declaring anything live, verify the REAL site serves the new behavior:
   ```bash
   curl -s https://hushyourmoney.com/ | grep -c "<a marker unique to this release>"
   ```
   If the rollout seems stuck, check the app's subscription/expiry state on the dashboard — it is blockheight-based, so read the CURRENT blockheight there before acting; never rely on previously recorded values.

## Rules and gotchas

- **Never declare the release complete** until step 6 passes on `https://hushyourmoney.com`. A new Hub digest does NOT mean Flux has rolled out.
- The container requires **no environment variables**. Optional override: `NUXT_PUBLIC_PSF_API_URL` (default `https://bch.fullstack.cash`).
- `bchn.fullstack.cash/v5` is retired — do not re-add it. `PSF_JWT_AUTH_TOKEN` is retired — do not re-add it.
- **Never commit credentials** (Docker Hub tokens, SSH keys, wallet seeds, API secrets) to this repository. Keep them in your local credential stores only.
- DNS is Cloudflare-fronted; `http://hushyourmoney.com` 301-redirects to HTTPS. If curl returns a Cloudflare error page, that is edge/origin state, not a build failure — check the Flux dashboard.
- If the smoke test fails, fix the source, recommit, and rebuild from step 1. Do NOT push a failing image.
