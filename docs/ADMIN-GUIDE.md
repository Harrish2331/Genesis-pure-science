# Genesis Pure Lifesciences — admin & deployment guide

## Signing in

The dashboard is at `/admin`. Accounts are configured only in server environment
variables; nothing about them is in the browser bundle.

| Variable | Purpose |
| --- | --- |
| `ADMIN_EMAIL` | Administrator login email |
| `ADMIN_PASSWORD_HASH` | scrypt hash — generate with `npm run admin:hash -- "a long passphrase"` |
| `ADMIN_SESSION_SECRET` | 32+ random characters (printed by the same command). Changing it signs everyone out |
| `EDITOR_EMAIL` | Optional editor login |
| `EDITOR_PASSWORD_HASH` | Optional editor hash (same command) |

Sessions are HMAC-signed, http-only, `SameSite=Strict` cookies that expire after
eight hours. Every dashboard page and API route re-checks the session; state-changing
requests must come from the site's own origin. Login attempts are rate-limited.

### Roles

| | Administrator | Editor |
| --- | --- | --- |
| Notices, Insights (create, edit, publish, schedule, preview, delete) | ✓ | ✓ |
| Image uploads | ✓ | ✓ |
| Products, Partners, Settings, Enquiries, Backup download | ✓ | — |

The role is worked out from the email on every request, so removing `EDITOR_EMAIL`
revokes the editor immediately.

## Notices and Insights

- **Save draft** keeps an item off the website. **Publish** makes it live.
- A **future date** on a published item schedules it: the dashboard shows
  *Scheduled* and it appears on the site automatically once the date passes.
- **Unpublish** returns a published item to draft.
- **Preview** shows the saved version (draft or not) in the public layout.
- If someone else saved the same item while you were editing, your save is refused
  rather than overwriting their work — reload to see their changes.
- Insights bodies use a safe Markdown subset: HTML is shown as plain text and links
  with unsafe schemes (such as `javascript:`) are not linked. Nothing is executed.

## Manufacturing partners

Partner profiles (capabilities, certifications, sites, export markets) are entered in
**Partners**. Lists take one entry per line; sites are `Name | Location | Role`.
Certifications are always shown as *stated by the partner*, never as Genesis's own.
A partner gets a profile page at `/manufacturing/<slug>` once it has a description.

## Storage

- **Vercel:** set `BLOB_READ_WRITE_TOKEN` (Vercel → Storage → Blob, linked to the
  project). Content and uploads are stored there. Required — serverless disk is read-only.
- **Local development:** without the token, content is stored in `./.data`.

There is no database and no migrations. Until the dashboard first saves a collection,
the site uses the seed data in `src/content/`. Older stored records are upgraded
automatically when read.

## Other environment variables

`NEXT_PUBLIC_SITE_URL` (required in production), `GOOGLE_SITE_VERIFICATION`
(optional), `CONTENT_REVIEW_MODE` (true keeps a deployment out of search
engines; automatic: on in development and previews, off in production). See
`.env.example`.

## What the public site shows

Only facts ticked “Confirmed” in **Settings**, and never sample records. Anything
still unconfirmed — and the legal pages, which need legal review — is listed in
the dashboard's **launch checklist**, not marked on the website.

## Enquiries

The website has no enquiry form: visitors contact Genesis by email, telephone or
WhatsApp. **Enquiries** in the dashboard keeps the enquiries received before the
form was removed; they are also included in the backup download.

## Checks

```bash
npx tsc --noEmit && npx eslint . && npm test && npm run build
```
