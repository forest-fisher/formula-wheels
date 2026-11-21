#!/usr/bin/env bash
# Run only from a NEW folder containing the prepared GitHub repository files.
# This creates forest-fisher/formula-wheels publicly, commits approved sources,
# and pushes the v1.0.0 tag. GitHub Actions then creates the downloadable Release.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
if [[ "${PWD##*/}" != 'formula-wheels' ]]; then
  echo 'ERROR: extract into a directory named formula-wheels outside the textbook repository.' >&2
  exit 1
fi
for cmd in git gh python node; do
  command -v "$cmd" >/dev/null || { echo "Missing required command: $cmd" >&2; exit 1; }
done
login="$(gh api user --jq .login)"
[[ "$login" == 'forest-fisher' ]] || { echo "ERROR: authenticated as $login, expected forest-fisher" >&2; exit 1; }
if gh repo view forest-fisher/formula-wheels >/dev/null 2>&1; then
  echo 'ERROR: the target repository already exists. Stop to avoid overwriting it.' >&2
  exit 1
fi
if git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo 'ERROR: directory is already inside a Git repository. Extract to a new, separate folder.' >&2
  exit 1
fi
python tools/verify_public_release.py
python tests/test_release.py
python tests/test_extended_gallery.py
python tests/test_postbuild.py
python tests/test_api_reference.py
python tests/test_licensing.py
python tests/test_gallery_status_layout.py
node tests/test_fixture_semantics.js
node tests/test_css_refresh.js
node tests/test_mobile_layout.js
node tests/test_schedule.js
node tests/test_child_boot.js
# PreTeXt gallery build will also be checked by the GitHub Actions workflow.
git init -b main
git add -A
git -c user.name='Forest Fisher' -c user.email='forest-fisher@users.noreply.github.com' \
  commit -m 'Initial public Formula Wheels 1.0.0 (approved internal 22.0)'
gh repo create forest-fisher/formula-wheels --public --source=. --remote=origin --push \
  --description 'Formula Wheels: accessible interactive equations for PreTeXt and standalone HTML (MPL-2.0)'
git tag -a v1.0.0 -m 'First public release: approved internal Formula Wheels 22.0'
git push origin v1.0.0
printf '\nPublished source and tag. Confirm GitHub Actions succeeded before considering the release complete:\n'
printf 'https://github.com/forest-fisher/formula-wheels/actions\n'
printf 'https://github.com/forest-fisher/formula-wheels/releases/tag/v1.0.0\n'
