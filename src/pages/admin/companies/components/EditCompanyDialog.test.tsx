import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditCompanyDialog } from "./EditCompanyDialog";
import type { Company } from "@/lib/db/admin-operations";

const mockCompany: Company = {
  id: "1",
  name: "Acme Insurance",
  country: "UAE",
  insuranceType: "motor",
  maxUserSlots: 10,
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  createdBy: "admin-user",
};

describe("EditCompanyDialog", () => {
  describe("Form loading and display", () => {
    it("should populate form fields with current company data", () => {
      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={vi.fn()}
        />
      );

      const nameInput = screen.getByDisplayValue("Acme Insurance");
      const countryInput = screen.getByDisplayValue("UAE");
      const slotsInput = screen.getByDisplayValue("10");

      expect(nameInput).toBeDefined();
      expect(countryInput).toBeDefined();
      expect(slotsInput).toBeDefined();
    });

    it("should display correct insurance type", () => {
      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={vi.fn()}
        />
      );

      const insuranceLabel = screen.getByText("Insurance Type");
      expect(insuranceLabel).toBeDefined();
    });

    it("should not be displayed when open is false", () => {
      render(
        <EditCompanyDialog
          open={false}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={vi.fn()}
        />
      );

      expect(screen.queryByText("Edit Company")).toBeNull();
    });
  });

  describe("Form validation", () => {
    it("should require non-empty company name", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByDisplayValue("Acme Insurance");
      await user.clear(nameInput);

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/All fields are required/i)).toBeDefined();
    });

    it("should require non-empty country", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const countryInput = screen.getByDisplayValue("UAE");
      await user.clear(countryInput);

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/All fields are required/i)).toBeDefined();
    });

    it("should require max slots to be at least 1", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const slotsInput = screen.getByDisplayValue("10");
      await user.clear(slotsInput);
      await user.type(slotsInput, "0");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should require max slots to be at most 100", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const slotsInput = screen.getByDisplayValue("10");
      await user.clear(slotsInput);
      await user.type(slotsInput, "101");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Form submission", () => {
    it("should call onSubmit with updated company data when form is valid", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByDisplayValue("Acme Insurance");
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Insurance");

      const countryInput = screen.getByDisplayValue("UAE");
      await user.clear(countryInput);
      await user.type(countryInput, "USA");

      const slotsInput = screen.getByDisplayValue("10");
      await user.clear(slotsInput);
      await user.type(slotsInput, "15");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          id: "1",
          name: "Updated Insurance",
          country: "USA",
          insuranceType: "motor",
          maxUserSlots: 15,
        });
      });
    });

    it("should trim whitespace from name and country", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByDisplayValue("Acme Insurance");
      await user.clear(nameInput);
      await user.type(nameInput, "  New Name  ");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "New Name",
          })
        );
      });
    });

    it("should show error message on submission failure", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockRejectedValue(new Error("Update failed"));

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByDisplayValue("Acme Insurance");
      await user.clear(nameInput);
      await user.type(nameInput, "New Name");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Update failed/)).toBeDefined();
      });
    });

    it("should disable save button while submitting", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 500))
      );

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={onSubmit}
        />
      );

      const nameInput = screen.getByDisplayValue("Acme Insurance");
      await user.clear(nameInput);
      await user.type(nameInput, "New Name");

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      expect(saveButton).toHaveAttribute("disabled");
    });
  });

  describe("Dialog lifecycle", () => {
    it("should close dialog when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={onOpenChange}
          onSubmit={vi.fn()}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("should close dialog after successful submission", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      );

      const saveButton = screen.getByRole("button", { name: /Save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("should reset form state when closed and reopened", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={vi.fn()}
        />
      );

      let nameInput = screen.getByDisplayValue("Acme Insurance");
      await user.clear(nameInput);
      await user.type(nameInput, "Changed");

      rerender(
        <EditCompanyDialog
          open={false}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={vi.fn()}
        />
      );

      rerender(
        <EditCompanyDialog
          open={true}
          company={mockCompany}
          onOpenChange={() => {}}
          onSubmit={vi.fn()}
        />
      );

      nameInput = screen.getByDisplayValue("Acme Insurance");
      expect(nameInput).toBeDefined();
    });
  });
});
