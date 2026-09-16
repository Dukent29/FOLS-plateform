/** Only server-managed Clerk public metadata may grant back-office access. */
export function getStaffRole(metadata: Record<string, unknown>) {
  const role = metadata.role;
  return role === "admin" || role === "manager" ? role : null;
}
