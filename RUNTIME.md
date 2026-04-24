# Runtime Requirements and Assumptions

This document captures the runtime dependencies and deployment assumptions for the SO Onboarding App. Read this before deploying or setting up a new development environment.

## Runtime Model

This app requires a **server-backed Next.js runtime**. It cannot be statically exported (`next export`) because it uses:

- API routes (`/api/templates/catalog`, `/api/templates/refresh`)
- Server-side filesystem access (`fs/promises`) for reading and writing the template catalog

## Local Data Store

The template catalog is persisted server-side at:

```
.local-data/template-catalog.json
```

This file is created automatically on the first successful Template Library refresh. The directory must be writable by the process running Next.js. It is excluded from version control via `.gitignore`.

On startup, the app loads this file via `/api/templates/catalog`. If the file does not exist, the app falls back to the seed catalog defined in `src/data/templates.ts`.

## OneDrive Sync Requirement (Template Library Refresh)

The "Refresh from SharePoint" feature (currently hidden from the UI pending a deployment solution) reads files from the local filesystem. It expects the Presidio Solution Ownership Teams folder to be synced to OneDrive on the machine running the Next.js server.

The app resolves the sync root by checking these paths in order:

1. `TEMPLATE_LIBRARY_SYNC_ROOT` environment variable (explicit override)
2. `%OneDriveCommercial%\Digital-delivery (Global) - Solution Ownership\Templates and Samples`
3. `%OneDriveCommercial%\Solution Ownership\Templates and Samples`
4. `%OneDrive%\Digital-delivery (Global) - Solution Ownership\Templates and Samples`
5. `%USERPROFILE%\OneDrive - Presidio Network Solutions\Digital-delivery (Global) - Solution Ownership\Templates and Samples`
6. `%USERPROFILE%\OneDrive - Presidio Network Solutions\Solution Ownership\Templates and Samples`

If none of these paths resolve, the refresh fails with a `MissingTemplateSyncMirrorError` and the UI displays step-by-step sync instructions.

To force a specific path during development or testing:

```bash
# .env.local
TEMPLATE_LIBRARY_SYNC_ROOT=C:\path\to\your\Templates and Samples
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `TEMPLATE_LIBRARY_SYNC_ROOT` | No | Explicit override for the OneDrive sync root path. Takes priority over all auto-detected paths. |
| `OneDriveCommercial` | No | Set automatically by OneDrive on Windows. Used for sync path resolution. |
| `OneDrive` | No | Set automatically by OneDrive. Fallback for sync path resolution. |
| `USERPROFILE` | No | Set automatically on Windows. Used for legacy sync path resolution. |

## Source of Truth Split

| Layer | Location | Purpose |
|---|---|---|
| Seed catalog | `src/data/templates.ts` | Curated, hand-authored template definitions. The baseline the app ships with. |
| Runtime catalog | `.local-data/template-catalog.json` | Persisted after a SharePoint refresh. Includes curated templates plus any auto-discovered artifacts from the synced folder. Takes precedence over the seed catalog at runtime. |

## Deployment Notes (AWS Amplify)

- The app is deployed on AWS Amplify using the configuration in `amplify.yml`.
- The `.local-data/` directory is ephemeral on Amplify — it does not persist across deploys. The runtime catalog must be committed to the repo or rebuilt after each deploy.
- The Template Library refresh button is currently hidden from the UI because the Amplify server has no OneDrive access. This is a known limitation pending a Graph API integration or admin upload solution.
