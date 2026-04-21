import { describe, expect, it } from "vitest";
import { assertOwnerAccess, getOwnerIdOrThrow } from "../lib/ownership";

describe("ownership guards", () => {
  describe("getOwnerIdOrThrow", () => {
    it("returns subject when identity exists", () => {
      expect(getOwnerIdOrThrow({ subject: "user_123" })).toBe("user_123");
    });

    it("throws when identity is missing", () => {
      expect(() => getOwnerIdOrThrow(null)).toThrow("Authentication required");
    });

    it("throws when subject is missing", () => {
      expect(() => getOwnerIdOrThrow({})).toThrow("Authentication required");
    });
  });

  describe("assertOwnerAccess", () => {
    it("allows access for matching owner", () => {
      expect(() => assertOwnerAccess("user_123", "user_123")).not.toThrow();
    });

    it("throws for mismatched owners", () => {
      expect(() => assertOwnerAccess("user_123", "user_456")).toThrow(
        "Unauthorized access to resource",
      );
    });

    it("throws when record owner is missing", () => {
      expect(() => assertOwnerAccess(undefined, "user_123")).toThrow(
        "Unauthorized access to resource",
      );
    });
  });
});
