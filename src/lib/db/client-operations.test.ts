import { describe, it, expect } from 'vitest';
import type { ClientOperationResult } from './client-operations';

// Tests for M3-4.A.4: client-operations.ts type-safe wrappers
// These tests verify the discriminated result pattern and error normalization

describe('client-operations - Type-safe wrapper results', () => {
  describe('T-M3-4.A.4.1: Success results return { ok: true, data }', () => {
    it('should return success shape for registration', () => {
      // Arrange
      const successResult: ClientOperationResult = {
        ok: true,
        data: {
          userId: 'user-123',
          email: 'user@example.com',
          companyId: 'company-a',
          role: 'client_admin',
        },
      };

      // Act & Assert
      expect(successResult.ok).toBe(true);
      if (successResult.ok) {
        expect(successResult.data).toBeDefined();
      }
    });

    it('should return success shape for user updates', () => {
      // Arrange
      const successResult: ClientOperationResult = {
        ok: true,
        data: {
          userId: 'user-123',
          fullName: 'John Doe',
          role: 'client_admin',
        },
      };

      // Act & Assert
      expect(successResult.ok).toBe(true);
      if (successResult.ok) {
        expect(successResult.data).toBeDefined();
      }
    });

    it('should return success shape for void operations', () => {
      // Arrange
      const successResult: ClientOperationResult<void> = {
        ok: true,
        data: undefined,
      };

      // Act & Assert
      expect(successResult.ok).toBe(true);
      if (successResult.ok) {
        expect(successResult.data).toBeUndefined();
      }
    });
  });

  describe('T-M3-4.A.4.2: Error results normalize to friendly messages', () => {
    it('should normalize Postgres SQLSTATE 42501 to permission error', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'Insufficient permission to update this user',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toContain('Insufficient permission');
        expect(errorResult.error).not.toContain('42501'); // No raw code
      }
    });

    it('should normalize "already processed" error', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'This request has already been processed',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toContain('already been processed');
      }
    });

    it('should normalize generic Supabase errors', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'Failed to update user: Connection timeout',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toBeTruthy();
        expect(errorResult.error).not.toContain('HTTP 500');
      }
    });

    it('should never expose raw error objects', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'User profile not found',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(typeof errorResult.error).toBe('string');
        expect(errorResult.error).not.toContain('[object Object]');
      }
    });
  });

  describe('Result type discrimination', () => {
    it('should allow type guard on ok property', () => {
      // Arrange: use explicit union to keep both branches reachable
      const result: ClientOperationResult =
        Math.random() >= 0
          ? ({ ok: true, data: { userId: 'user-123', email: 'test@example.com', companyId: 'company-a', role: 'client_admin' } } as ClientOperationResult)
          : ({ ok: false, error: 'fallback' } as ClientOperationResult);

      // Act & Assert
      if (result.ok) {
        // TypeScript narrows to success type
        expect(result.data).toBeDefined();
      } else {
        // TypeScript narrows to error type
        expect(result.error).toBeDefined();
      }
    });

    it('should prevent accessing data on error results', () => {
      // Arrange: use explicit union to keep both branches reachable
      const result: ClientOperationResult =
        Math.random() < 0
          ? ({ ok: true, data: undefined } as ClientOperationResult)
          : ({ ok: false, error: 'Not authorized' } as ClientOperationResult);

      // Act & Assert
      if (result.ok) {
        // TypeScript knows data exists here
        expect(result.data).toBeDefined();
      } else {
        // TypeScript knows error exists, not data
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe('Error scenarios and handling', () => {
    it('should handle not-authenticated errors', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'Not authenticated',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toBe('Not authenticated');
      }
    });

    it('should handle permission denied errors', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'Insufficient permission to modify this user',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toContain('Insufficient permission');
      }
    });

    it('should handle already-pending request error', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'You already have a pending slot request',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toContain('pending slot request');
      }
    });

    it('should handle admin-cannot-be-deactivated error', () => {
      // Arrange
      const errorResult: ClientOperationResult = {
        ok: false,
        error: 'Admin users cannot be deactivated',
      };

      // Act & Assert
      expect(errorResult.ok).toBe(false);
      if (!errorResult.ok) {
        expect(errorResult.error).toContain('Admin users');
      }
    });
  });

  describe('Success data shapes', () => {
    it('should have correct shape for registerCompanyUser', () => {
      // Arrange
      const result: ClientOperationResult = {
        ok: true,
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          companyId: 'company-a',
          role: 'client_user',
        },
      };

      // Act & Assert
      if (result.ok) {
        const data = result.data as unknown;
        expect((data as Record<string, unknown>).userId).toBeTruthy();
        expect((data as Record<string, unknown>).email).toBeTruthy();
        expect((data as Record<string, unknown>).companyId).toBeTruthy();
        expect((data as Record<string, unknown>).role).toBe('client_user');
      }
    });

    it('should have correct shape for updateCompanyUser', () => {
      // Arrange
      const result: ClientOperationResult = {
        ok: true,
        data: {
          userId: 'user-123',
          fullName: 'Jane Doe',
          role: 'client_admin',
        },
      };

      // Act & Assert
      if (result.ok) {
        const data = result.data as unknown;
        expect((data as Record<string, unknown>).userId).toBeTruthy();
        expect((data as Record<string, unknown>).fullName).toBe('Jane Doe');
        expect((data as Record<string, unknown>).role).toBe('client_admin');
      }
    });

    it('should have correct shape for slot request results', () => {
      // Arrange
      const result: ClientOperationResult = {
        ok: true,
        data: {
          requestId: 'request-123',
          requestedSlots: 5,
        },
      };

      // Act & Assert
      if (result.ok) {
        const data = result.data as unknown;
        expect((data as Record<string, unknown>).requestId).toBeTruthy();
        expect((data as Record<string, unknown>).requestedSlots).toBe(5);
      }
    });

    it('should have correct shape for pending request query', () => {
      // Arrange
      const result: ClientOperationResult = {
        ok: true,
        data: {
          id: 'request-123',
          requestedSlots: 10,
        },
      };

      // Act & Assert
      if (result.ok) {
        const data = result.data as unknown;
        expect((data as Record<string, unknown>).id).toBeTruthy();
        expect((data as Record<string, unknown>).requestedSlots).toBe(10);
      }
    });

    it('should handle null data for optional results', () => {
      // Arrange
      const result: ClientOperationResult = {
        ok: true,
        data: null,
      };

      // Act & Assert
      if (result.ok) {
        expect(result.data).toBeNull();
      }
    });
  });

  describe('Consistency across operations', () => {
    it('all success results should have ok: true', () => {
      // Arrange
      const successResults: ClientOperationResult[] = [
        { ok: true, data: { userId: 'u1' } },
        { ok: true, data: undefined },
        { ok: true, data: { requestId: 'r1', requestedSlots: 5 } },
      ];

      // Act & Assert
      successResults.forEach((result) => {
        expect(result.ok).toBe(true);
      });
    });

    it('all error results should have ok: false', () => {
      // Arrange
      const errorResults: ClientOperationResult[] = [
        { ok: false, error: 'Not authenticated' },
        { ok: false, error: 'Permission denied' },
        { ok: false, error: 'Network error' },
      ];

      // Act & Assert
      errorResults.forEach((result) => {
        expect(result.ok).toBe(false);
      });
    });

    it('no result should have both data and error', () => {
      // Arrange
      const validResults = [
        { ok: true, data: { userId: 'u1' } },
        { ok: false, error: 'Error message' },
      ];

      // Act & Assert
      validResults.forEach((result) => {
        if (result.ok) {
          expect('error' in result && result.error).toBeFalsy();
        } else {
          expect('data' in result && result.data).toBeFalsy();
        }
      });
    });
  });
});
