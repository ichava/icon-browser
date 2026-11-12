#!/bin/sh
# Runs a Playwright suite on this machine inside the same image CI uses, so its pixels and
# its behaviour match CI's without a push and a 5-8 minute wait (Sim, 2026-10-28).
#
#   npm run visual:linux          regenerate the visual baselines, print what moved
#   npm run visual:linux:check    compare against the committed baselines, change nothing
#   npm run e2e:linux             run the behavioural E2E suite
#
# Needs Docker. Arguments after the mode go to `playwright test` (a spec file, --grep ...).
# The image is pinned here once; check:playwright-image fails if it drifts from ci.yml's
# visual job, the seed workflow or @playwright/test.
set -eu

IMAGE=mcr.microsoft.com/playwright:v1.65.0-noble
mode=${1:?usage: scripts/linux.sh visual-update|visual-check|e2e [playwright args]}
shift

if ! command -v docker >/dev/null 2>&1; then
  echo "scripts/linux.sh: Docker is not installed or not on PATH; CI's image needs it." >&2
  exit 127
fi

exec docker run --rm --ipc=host -v "$PWD":/src "$IMAGE" sh /src/scripts/visual-linux.sh "$mode" "$@"
