/**
 * Dashboard roles. Pure on purpose: unit tests import this file directly.
 *
 *   admin   everything (configured with ADMIN_EMAIL / ADMIN_PASSWORD_HASH)
 *   editor  Notices and Insights only, plus image uploads for them
 *           (optional; EDITOR_EMAIL / EDITOR_PASSWORD_HASH)
 *
 * An "area" is a content collection name or one of the other dashboard
 * sections. Anything not listed for the editor is administrator-only.
 */

export type Role = "admin" | "editor";

export type Area = "notices" | "insights" | "media" | "products" | "partners" | "settings" | "enquiries" | "export";

const EDITOR_AREAS: readonly string[] = ["notices", "insights", "media"];

export function can(role: Role, area: string): boolean {
  return role === "admin" || EDITOR_AREAS.includes(area);
}

export const ROLE_LABELS: Record<Role, string> = { admin: "Administrator", editor: "Editor" };
