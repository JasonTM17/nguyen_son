# Owner-managed CV

Public visitors download the currently published PDF through `GET /api/cv?download=1`; `GET /api/cv` exposes only filename, size and update time. No CV button appears until a real document is published. The administration route is opened directly at `/admin`; there is no administration link on the public page. Authentication, rather than route secrecy, enforces owner access.

The `/admin` shell has an exact Vercel SPA rewrite, so direct visits and reloads work without a hash. Historical `/#admin-cv` bookmarks canonicalize in the browser; `/admin-cv` redirects to `/admin`. Setup capabilities stay in `#setup=...` and are removed after capture, never moved into URL queries. Admin HTML responses request `noindex, nofollow, nosnippet`, no referrer and no framing; public page indexing is unchanged. Crawlers may still ignore indexing directives.

The owner receives a private initial link `/admin#setup=<capability>` and chooses their username/password. The fragment is captured in memory then removed from the visible URL; it is never a query to a server or saved in browser storage. Initialization creates exactly one account atomically. Expired/lost setup links require the operator to issue a new digest/expiry. Never put credentials or an actual setup capability into documentation, source or screenshots.

## Runtime configuration

- `BLOB_READ_WRITE_TOKEN`: dedicated **private** Vercel Blob store, linked to production only. Never use `VITE_` variables or client upload tokens for this store.
- `CV_SETUP_HASH`: SHA-256 hex digest of an operator-generated 32-byte base64url initial capability.
- `CV_SETUP_EXPIRES`: expiry as epoch milliseconds. Initialization is impossible when configuration is missing or expired. Once owner state exists, setup cannot overwrite it.

The Vercel management API token is used only by release tooling in session memory, never deployed or stored as an environment variable.

## Owner workflow

1. Open the private setup link once; choose a username of 3–40 ASCII letters/numbers/`._-` and password of 15–128 characters.
2. Sign in at `/admin`; select one or more PDFs, each up to 3 MiB, and press **Thêm vào thư viện** (the button includes the selected count). Up to 20 versions are saved privately; adding a file never changes the published CV.
3. Each document has **Đổi tên**, **Thay PDF**, private **Tải PDF**, **Công khai** and **Xóa** actions. Exactly one document may be public. Replacement of a published entry updates its public bytes and filename after successful commit. **Ẩn CV** clears public access while retaining all library documents. Published entries must be hidden or superseded before deletion. No redeploy is needed.
4. Change account/password using the current password. This signs out the current session and invalidates all old cookies. A new login replaces the previous session; sessions expire after eight hours.

Batch additions run sequentially, refreshing authenticated status, CSRF and revision before starting and after each acknowledged file. Per-file progress distinguishes saved, failed/check-needed and not-started files. A failure, expired session, conflict or uncertain request stops the remaining batch; acknowledged files remain saved and the public selection is unchanged. Reload and inspect the library before resubmitting after an uncertain outcome. Files are not automatically retried. Total selected files plus the existing library may not exceed 20.

Storage/auth state is read with `useCache:false`; writes use ETag compare-and-swap. Auth/session and document pointer share one owner record so an upload started before logout/credential change cannot publish afterwards. Conflicts require a reload/retry; failed publication preserves the old document. Durable login reservations enforce five attempts per fixed 15-minute window, including parallel requests and incorrect current-password attempts. Storage failures deny admin operations.

Legacy current/previous documents are hydrated into the library on read without modifying storage. The existing public pointer, file bytes and account/session remain untouched by deployment. The additive library persists on the next owner mutation. Authenticated status alone returns document IDs/metadata; `GET /api/cv-admin?download=<id>` requires the owner cookie and resolves a validated path from stored state, never caller paths or URLs. New handlers accept cached legacy `upload` actions while preserving unrelated library documents.

Historical public readers remain compatible with the retained `current` field. **After library mutations, rolling back to the old administrator implementation is public-read-only:** do not use old upload/remove actions, which did not understand retained library files. Restore a library-aware release before resuming owner mutations. Failed replacements delete only their new orphan; successful replacement/delete cleans only the displaced document after commit. Removing a library document is permanent; there is no automatic per-document edit history.

Cookies are `__Host-`, Secure, HttpOnly and SameSite=Strict. Mutations enforce the exact production origin, JSON and a session-derived CSRF header. The canonical production hostname is the only allowed mutation origin; preview URLs can display the shell but cannot manage the live account.

Password inputs offer show/hide controls without submitting the form. CV API requests have a 30-second browser timeout. A timeout does not prove that a server mutation was cancelled: the owner is told to reload and check state before resubmitting. Non-JSON proxy/network errors become a generic localized message; server validation messages remain intact.

PDFs are bounded and checked for filename, canonical base64, signature and EOF marker. These checks are **not malware scanning**. Files are always sent as attachments with nosniff and sandbox CSP, not embedded into the page. Blob URLs/tokens and private state never enter public responses. Account/password recovery requires a separately authorized operator procedure; there is no public reset or registration endpoint.

The SDK is pinned; scoped transitive overrides patch its HTTP and config dependencies. Before release verify `node --test server/cv/service.test.mjs`, `npx vitest run src/features/cv/cv.test.tsx`, build, lint and the exact-snapshot auth review. Provider/latest-read/CAS probes and owner-driven production upload are separate evidence.

