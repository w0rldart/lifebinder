import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("contacts", "routes/contacts.tsx"),
  route("access", "routes/access.tsx"),
  route("accounts", "routes/accounts.tsx"),
  route("documents", "routes/documents.tsx"),
  route("physical-security", "routes/physical-security.tsx"),
  route("security-recovery", "routes/security-recovery.tsx"),
  route("will-testaments", "routes/will-testaments.tsx"),
  route("financial", "routes/financial.tsx"),
  route("emergency", "routes/emergency.tsx"),
  route("notes", "routes/notes.tsx"),
  route("export", "routes/export.tsx"),
  route("help", "routes/help.tsx"),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig;
