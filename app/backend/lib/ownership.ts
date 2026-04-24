export type IdentityLike = {
  subject?: string;
} | null;

export function getOwnerIdOrThrow(identity: IdentityLike): string {
  const ownerId = identity?.subject;
  if (!ownerId) {
    throw new Error("Authentication required");
  }
  return ownerId;
}

export function assertOwnerAccess(
  recordOwnerId: string | undefined,
  actorOwnerId: string,
): void {
  if (!recordOwnerId || recordOwnerId !== actorOwnerId) {
    throw new Error("Unauthorized access to resource");
  }
}
