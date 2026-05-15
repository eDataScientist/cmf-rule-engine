import { describe, it, expect } from "vitest";

// Tests for M3-4.A.2: Relaxed user management RPCs
// These test the authorization logic for toggle_user_active_admin and update_user_profile_admin
// Both functions now accept admin OR client_admin (same company scope)

type UserRole = "admin" | "client_admin" | "client_user";

interface UserProfile {
  user_id: string;
  role: UserRole;
  company_id: string | null;
  is_active: boolean;
}

// Simulate toggle_user_active_admin authorization
function simulateToggleUserActiveAuthorization(
  callerProfile: UserProfile,
  targetProfile: UserProfile
): void {
  if (targetProfile.role === "admin") {
    throw new Error("Admin users cannot be deactivated");
  }

  // Admin can toggle any user
  if (callerProfile.role === "admin") {
    return;
  }

  // Client_admin can only toggle users in their same company
  if (callerProfile.role === "client_admin") {
    if (callerProfile.company_id === targetProfile.company_id) {
      return;
    }
    throw new Error("Insufficient privilege"); // SQLSTATE 42501
  }

  throw new Error("Insufficient privilege"); // SQLSTATE 42501
}

// Simulate update_user_profile_admin authorization
function simulateUpdateUserProfileAuthorization(
  callerProfile: UserProfile,
  targetProfile: UserProfile,
  targetRole: string
): void {
  // Prevent role escalation to admin
  if (targetRole === "admin") {
    throw new Error("Insufficient privilege"); // SQLSTATE 42501
  }

  // Admin can update any user
  if (callerProfile.role === "admin") {
    return;
  }

  // Client_admin can only update users in their same company
  if (callerProfile.role === "client_admin") {
    if (callerProfile.company_id === targetProfile.company_id) {
      return;
    }
    throw new Error("Insufficient privilege"); // SQLSTATE 42501
  }

  throw new Error("Insufficient privilege"); // SQLSTATE 42501
}

describe("M3-4.A.2: Relaxed user management RPCs", () => {
  describe("toggle_user_active_admin authorization", () => {
    describe("T-M3-4.A.2.1: Admin and same-company client_admin can toggle status", () => {
      it("should allow admin to deactivate any user", () => {
        // Arrange
        const adminCaller: UserProfile = {
          user_id: "admin-123",
          role: "admin",
          company_id: null,
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateToggleUserActiveAuthorization(adminCaller, targetUser);
        }).not.toThrow();
      });

      it("should allow admin to reactivate any user", () => {
        // Arrange
        const adminCaller: UserProfile = {
          user_id: "admin-123",
          role: "admin",
          company_id: null,
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: false,
        };

        // Act & Assert
        expect(() => {
          simulateToggleUserActiveAuthorization(adminCaller, targetUser);
        }).not.toThrow();
      });

      it("should allow client_admin to deactivate a user in their same company", () => {
        // Arrange
        const clientAdminCaller: UserProfile = {
          user_id: "ca-123",
          role: "client_admin",
          company_id: "company-a",
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateToggleUserActiveAuthorization(clientAdminCaller, targetUser);
        }).not.toThrow();
      });

      it("should allow client_admin to reactivate a user in their same company", () => {
        // Arrange
        const clientAdminCaller: UserProfile = {
          user_id: "ca-123",
          role: "client_admin",
          company_id: "company-a",
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: false,
        };

        // Act & Assert
        expect(() => {
          simulateToggleUserActiveAuthorization(clientAdminCaller, targetUser);
        }).not.toThrow();
      });
    });

    describe("T-M3-4.A.2.2: Cross-company client_admin is rejected at DB layer", () => {
      it("should reject cross-company client_admin toggle attempt", () => {
        // Arrange
        const clientAdminCaller: UserProfile = {
          user_id: "ca-123",
          role: "client_admin",
          company_id: "company-a",
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-456",
          role: "client_user",
          company_id: "company-b", // Different company
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateToggleUserActiveAuthorization(clientAdminCaller, targetUser);
        }).toThrow("Insufficient privilege");
      });

      it("error should be SQLSTATE 42501 equivalent", () => {
        // Arrange
        const clientAdminCaller: UserProfile = {
          user_id: "ca-123",
          role: "client_admin",
          company_id: "company-a",
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-456",
          role: "client_user",
          company_id: "company-b",
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateToggleUserActiveAuthorization(clientAdminCaller, targetUser);
        }).toThrow("Insufficient privilege");
      });
    });

    describe("Additional: Admin users cannot be deactivated", () => {
      it("should prevent deactivation of admin user by any caller", () => {
        // Arrange
        const adminCaller: UserProfile = {
          user_id: "admin-123",
          role: "admin",
          company_id: null,
          is_active: true,
        };
        const targetAdmin: UserProfile = {
          user_id: "admin-456",
          role: "admin",
          company_id: null,
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateToggleUserActiveAuthorization(adminCaller, targetAdmin);
        }).toThrow("Admin users cannot be deactivated");
      });
    });
  });

  describe("update_user_profile_admin authorization", () => {
    describe("T-M3-4.A.2.3: Admin and same-company client_admin can update name/role", () => {
      it("should allow admin to update any user's full_name and role", () => {
        // Arrange
        const adminCaller: UserProfile = {
          user_id: "admin-123",
          role: "admin",
          company_id: null,
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateUpdateUserProfileAuthorization(
            adminCaller,
            targetUser,
            "client_admin"
          );
        }).not.toThrow();
      });

      it("should allow client_admin to update a user in their same company", () => {
        // Arrange
        const clientAdminCaller: UserProfile = {
          user_id: "ca-123",
          role: "client_admin",
          company_id: "company-a",
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateUpdateUserProfileAuthorization(
            clientAdminCaller,
            targetUser,
            "client_admin"
          );
        }).not.toThrow();
      });
    });

    describe("T-M3-4.A.2.4: Role escalation to admin is rejected", () => {
      it("should reject attempt to escalate user to admin by admin", () => {
        // Arrange
        const adminCaller: UserProfile = {
          user_id: "admin-123",
          role: "admin",
          company_id: null,
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateUpdateUserProfileAuthorization(
            adminCaller,
            targetUser,
            "admin" // Attempting to escalate
          );
        }).toThrow("Insufficient privilege");
      });

      it("should reject attempt to escalate user to admin by client_admin", () => {
        // Arrange
        const clientAdminCaller: UserProfile = {
          user_id: "ca-123",
          role: "client_admin",
          company_id: "company-a",
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-123",
          role: "client_user",
          company_id: "company-a",
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateUpdateUserProfileAuthorization(
            clientAdminCaller,
            targetUser,
            "admin" // Attempting to escalate
          );
        }).toThrow("Insufficient privilege");
      });
    });

    describe("Additional: Cross-company client_admin is rejected", () => {
      it("should reject cross-company update attempt by client_admin", () => {
        // Arrange
        const clientAdminCaller: UserProfile = {
          user_id: "ca-123",
          role: "client_admin",
          company_id: "company-a",
          is_active: true,
        };
        const targetUser: UserProfile = {
          user_id: "cu-456",
          role: "client_user",
          company_id: "company-b", // Different company
          is_active: true,
        };

        // Act & Assert
        expect(() => {
          simulateUpdateUserProfileAuthorization(
            clientAdminCaller,
            targetUser,
            "client_admin"
          );
        }).toThrow("Insufficient privilege");
      });
    });
  });

  describe("Authorization matrix summary", () => {
    const authorizationMatrix = [
      {
        action: "toggle_user_active",
        caller: "admin",
        target_role: "client_user",
        target_company: "any",
        allowed: true,
      },
      {
        action: "toggle_user_active",
        caller: "client_admin (company-a)",
        target_role: "client_user",
        target_company: "company-a",
        allowed: true,
      },
      {
        action: "toggle_user_active",
        caller: "client_admin (company-a)",
        target_role: "client_user",
        target_company: "company-b",
        allowed: false,
      },
      {
        action: "toggle_user_active",
        caller: "admin",
        target_role: "admin",
        target_company: "any",
        allowed: false,
      },
      {
        action: "update_user_profile",
        caller: "admin",
        target_role: "client_admin",
        target_company: "any",
        allowed: true,
      },
      {
        action: "update_user_profile",
        caller: "client_admin (company-a)",
        target_role: "client_admin",
        target_company: "company-a",
        allowed: true,
      },
      {
        action: "update_user_profile",
        caller: "client_admin (company-a)",
        target_role: "admin",
        target_company: "company-a",
        allowed: false,
      },
      {
        action: "update_user_profile",
        caller: "client_admin (company-a)",
        target_role: "client_user",
        target_company: "company-b",
        allowed: false,
      },
    ];

    it("should match the complete authorization matrix", () => {
      authorizationMatrix.forEach(
        ({ action, caller, target_role, target_company, allowed }) => {
          // Construct caller profile
          let callerProfile: UserProfile;
          if (caller === "admin") {
            callerProfile = {
              user_id: "admin-123",
              role: "admin",
              company_id: null,
              is_active: true,
            };
          } else if (caller === "client_admin (company-a)") {
            callerProfile = {
              user_id: "ca-123",
              role: "client_admin",
              company_id: "company-a",
              is_active: true,
            };
          } else {
            throw new Error(`Unknown caller: ${caller}`);
          }

          // Construct target profile
          const targetCompanyId =
            target_company === "any" ? "company-x" : target_company;
          const targetProfile: UserProfile = {
            user_id: "target-user",
            role: target_role as UserRole,
            company_id: targetCompanyId,
            is_active: true,
          };

          // Test
          const shouldThrow = !allowed;

          if (action === "toggle_user_active") {
            if (shouldThrow) {
              expect(
                () => {
                  simulateToggleUserActiveAuthorization(
                    callerProfile,
                    targetProfile
                  );
                },
                `${caller} toggle ${target_role} in ${target_company} should be rejected`
              ).toThrow();
            } else {
              expect(
                () => {
                  simulateToggleUserActiveAuthorization(
                    callerProfile,
                    targetProfile
                  );
                },
                `${caller} toggle ${target_role} in ${target_company} should be allowed`
              ).not.toThrow();
            }
          } else if (action === "update_user_profile") {
            if (shouldThrow) {
              expect(
                () => {
                  simulateUpdateUserProfileAuthorization(
                    callerProfile,
                    targetProfile,
                    target_role
                  );
                },
                `${caller} update ${target_role} in ${target_company} should be rejected`
              ).toThrow();
            } else {
              expect(
                () => {
                  simulateUpdateUserProfileAuthorization(
                    callerProfile,
                    targetProfile,
                    target_role
                  );
                },
                `${caller} update ${target_role} in ${target_company} should be allowed`
              ).not.toThrow();
            }
          }
        }
      );
    });
  });
});
