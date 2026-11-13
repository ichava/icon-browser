#!/bin/sh
# Runs inside the Playwright image for .dev/browser/linux.sh, against a copy of the checkout.
#
# Mounting the checkout and installing in place failed two ways. In a git worktree `.git` is a
# pointer file to a directory outside the mount, so npm's git lookup for a git dependency died
# with "not a git repository". And `npm install` in the container replaced the host's
# node_modules with Linux binaries, breaking the next build on the Mac.
#
# So the copy leaves out .git, node_modules, build output and agent worktrees, the install and
# the run happen in the copy, and only the regenerated snapshot folders come back.
#
# Modes: visual-update (regenerate, copy back, print the drift table), visual-check (compare
# only), e2e (the behavioural suite). A first argument that is not a mode is read as
# visual-update, which is what this script did before it took modes.
set -eu

case "${1:-}" in
  visual-update|visual-check|e2e) mode=$1; shift ;;
  *) mode=visual-update ;;
esac

src=${VISUAL_SRC:-/src}
work=${VISUAL_WORK:-$(mktemp -d)}

tar -C "$src" \
  --exclude=./.git --exclude=./node_modules --exclude=./.cache --exclude=./vendor --exclude=./.claude \
  --exclude=./test-results --exclude=./playwright-report \
  -cf - . | tar -C "$work" -xf -

cd "$work"
npm install --no-audit --no-fund

status=0
case "$mode" in
  e2e)
    npx playwright test --config=e2e/browser/playwright.config.ts "$@" || status=$?
    ;;
  visual-check)
    npx playwright test --config=e2e/browser/playwright.visual.config.ts "$@" || status=$?
    ;;
  visual-update)
    # Measure first, so the summary can say how far each baseline moved.
    npx playwright test --config=e2e/browser/playwright.visual.config.ts --reporter=json "$@" > "$work/.visual-drift.json" 2>/dev/null || true
    npx playwright test --config=e2e/browser/playwright.visual.config.ts --update-snapshots "$@" || status=$?
    changed=""
    for f in e2e/browser/*-snapshots/*.png; do
      [ -f "$f" ] || continue
      if ! cmp -s "$f" "$src/$f"; then changed="$changed $f"; fi
    done
    for dir in e2e/browser/*-snapshots; do
      if [ -d "$dir" ]; then cp -R "$dir" "$src/e2e/browser/"; fi
    done
    if [ -n "$changed" ]; then
      echo
      echo "Changed baselines (review them with git diff before committing):"
      # shellcheck disable=SC2086 # one path per word, by construction
      # The table is a courtesy: a missing report must not fail a run that regenerated fine.
      node .dev/browser/visual-drift.mjs "$work/.visual-drift.json" $changed || echo "(drift table unavailable)"
    else
      echo "Baselines already match; nothing changed."
    fi
    ;;
esac

exit "$status"
