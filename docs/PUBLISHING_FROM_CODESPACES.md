# Publishing the first public Formula Wheels release from GitHub Codespaces

This is a **one-time publication procedure** for **Forest Fisher**, using the approved internal Version 22.0 as public release `v1.0.0`. This does not update or deploy `college-algebra-from-here`.

The publication bundle contains a folder named `formula-wheels/`. Extract that folder **outside** the textbook repository, for example under `/workspaces/` beside (not inside) `college-algebra-from-here`.

1. Upload `formula_wheels_github_ready_v1_0_0.zip` to your Codespace using its file explorer, temporarily placing the ZIP at the root of `college-algebra-from-here` if necessary. Do **not** commit that ZIP to the textbook repository.
2. In the Codespaces terminal, run:

   ```bash
   unzip /workspaces/college-algebra-from-here/formula_wheels_github_ready_v1_0_0.zip -d /workspaces/
   cd /workspaces/formula-wheels
   bash PUBLISH_FROM_CODESPACES.sh
   ```

3. The script checks `gh` authentication for `forest-fisher`, verifies the unmodified original archive, runs local non-browser tests, creates a **new public** `forest-fisher/formula-wheels` repository, and pushes the source and annotated `v1.0.0` tag. GitHub Actions then runs the full CI gallery build and (only if it passes) attaches the verified original archive to the GitHub Release.
4. Check [GitHub Actions](https://github.com/forest-fisher/formula-wheels/actions) for passing validation and then confirm [the v1.0.0 release](https://github.com/forest-fisher/formula-wheels/releases/tag/v1.0.0) exists with three assets: the archived ZIP, `SHA256SUMS.txt`, and `PUBLIC_VERSION.json`. If Actions needs enabling, enable it for the new repository and rerun the failed or skipped workflow as appropriate.
5. Delete the temporary ZIP from your textbook working tree; it is not part of the textbook dependency installation.

**Safety behavior:** The script stops if the remote repository already exists or if the extracted directory is inside an existing Git checkout. It does not alter your textbook repository, delete an existing GitHub repository, or overwrite a published release. If `gh` authentication is missing, run `gh auth login` in Codespaces and retry before it creates anything.

The release asset's SHA-256 must be:

```text
c0c48f8b29836d636629635b9ebec22fe516857d49fda5ca896d12fc05b93e93
```

The approved original ZIP contains historical `22.0` version labels; the publication mapping is in `PUBLIC_VERSION.json` and the release notes. Do not modify the approved ZIP to make those labels read `1.0.0`.
