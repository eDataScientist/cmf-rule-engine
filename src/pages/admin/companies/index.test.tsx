import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminCompanies from "./index";
import * as adminOps from "@/lib/db/admin-operations";
import type { Company } from "@/lib/db/admin-operations";

vi.mock("@/lib/db/admin-operations", () => ({
  getCompanies: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
  deactivateCompany: vi.fn(),
  reactivateCompany: vi.fn(),
}));

vi.mock("@/store/atoms/header", () => ({
  headerBreadcrumbsAtom: {
    __type: "atom",
  },
}));

vi.mock("jotai", () => ({
  useSetAtom: vi.fn(() => vi.fn()),
}));

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Acme Insurance",
    country: "UAE",
    insuranceType: "motor",
    maxUserSlots: 10,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    createdBy: "admin-user",
  },
  {
    id: "2",
    name: "Global Health",
    country: "UK",
    insuranceType: "medical",
    maxUserSlots: 5,
    isActive: false,
    createdAt: "2026-01-02T00:00:00Z",
    createdBy: "admin-user",
  },
];

describe("AdminCompanies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminOps.getCompanies).mockResolvedValue(mockCompanies);
  });

  describe("Loading and initial render", () => {
    it("should load companies on mount", async () => {
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });
      expect(adminOps.getCompanies).toHaveBeenCalledTimes(1);
    });

    it("should display companies page header", async () => {
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Companies")).toBeDefined();
        expect(screen.getByText("Manage client companies and their access")).toBeDefined();
      });
    });
  });

  describe("Company listing", () => {
    it("should display all companies in a table", async () => {
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
        expect(screen.getByText("Global Health")).toBeDefined();
      });
    });

    it("should display company details correctly", async () => {
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("UAE")).toBeDefined();
        expect(screen.getByText("UK")).toBeDefined();
        expect(screen.getByText("motor")).toBeDefined();
        expect(screen.getByText("medical")).toBeDefined();
      });
    });

    it("should display status badge for active/inactive companies", async () => {
      render(<AdminCompanies />);
      await waitFor(() => {
        const activeBadges = screen.getAllByText("Active");
        expect(activeBadges.length).toBeGreaterThan(0);
        expect(screen.getByText("Inactive")).toBeDefined();
      });
    });

    it("should display empty state when no companies exist", async () => {
      vi.mocked(adminOps.getCompanies).mockResolvedValue([]);
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("No companies yet")).toBeDefined();
      });
    });

    it("should display action buttons for each company", async () => {
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });
      const powerButtons = screen.getAllByTitle(/Deactivate|Reactivate/);
      expect(powerButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Search functionality", () => {
    it("should filter companies by name", async () => {
      const user = userEvent.setup();
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const searchInput = screen.getByPlaceholderText("Search companies...");
      await user.type(searchInput, "Acme");

      expect(screen.getByText("Acme Insurance")).toBeDefined();
      expect(screen.queryByText("Global Health")).toBeNull();
    });

    it("should filter companies by country", async () => {
      const user = userEvent.setup();
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const searchInput = screen.getByPlaceholderText("Search companies...");
      await user.type(searchInput, "UAE");

      expect(screen.getByText("Acme Insurance")).toBeDefined();
      expect(screen.queryByText("Global Health")).toBeNull();
    });

    it("should filter companies by insurance type", async () => {
      const user = userEvent.setup();
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const searchInput = screen.getByPlaceholderText("Search companies...");
      await user.type(searchInput, "medical");

      expect(screen.queryByText("Acme Insurance")).toBeNull();
      expect(screen.getByText("Global Health")).toBeDefined();
    });

    it("should show empty state when search returns no results", async () => {
      const user = userEvent.setup();
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const searchInput = screen.getByPlaceholderText("Search companies...");
      await user.type(searchInput, "NonExistent");

      expect(screen.getByText("No companies match your search")).toBeDefined();
    });

    it("should clear search results when search is cleared", async () => {
      const user = userEvent.setup();
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const searchInput = screen.getByPlaceholderText("Search companies...");
      await user.type(searchInput, "Acme");
      expect(screen.queryByText("Global Health")).toBeNull();

      await user.clear(searchInput);
      expect(screen.getByText("Global Health")).toBeDefined();
    });
  });

  describe("Create company dialog", () => {
    it("should open create dialog when New Company button is clicked", async () => {
      const user = userEvent.setup();
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const newCompanyButton = screen.getByText("New Company");
      await user.click(newCompanyButton);

      expect(screen.getByText("Create Company")).toBeDefined();
    });

    it("should close dialog when Cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const newCompanyButton = screen.getByText("New Company");
      await user.click(newCompanyButton);
      expect(screen.getByText("Create Company")).toBeDefined();

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(screen.queryByText("Create Company")).toBeNull();
    });

    it("should refresh company list after successful creation", async () => {
      const user = userEvent.setup();
      const newCompanyData: Company = {
        id: "3",
        name: "New Company",
        country: "US",
        insuranceType: "motor",
        maxUserSlots: 8,
        isActive: true,
        createdAt: "2026-05-15T00:00:00Z",
        createdBy: "admin-user",
      };

      vi.mocked(adminOps.createCompany).mockResolvedValue(newCompanyData);
      vi.mocked(adminOps.getCompanies)
        .mockResolvedValueOnce(mockCompanies)
        .mockResolvedValueOnce([...mockCompanies, newCompanyData]);

      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const newCompanyButton = screen.getByText("New Company");
      await user.click(newCompanyButton);

      const nameInput = screen.getByPlaceholderText("e.g. Acme Insurance");
      const countryInput = screen.getByPlaceholderText("e.g. UAE");
      const createButton = screen.getByRole("button", { name: /Create/i });

      await user.type(nameInput, "New Company");
      await user.type(countryInput, "US");
      await user.click(createButton);

      await waitFor(() => {
        expect(adminOps.createCompany).toHaveBeenCalledWith({
          name: "New Company",
          country: "US",
          insuranceType: "medical",
          maxUserSlots: 5,
        });
        expect(screen.getAllByText("New Company").length).toBeGreaterThan(1);
      });
    });
  });

  describe("Deactivate/Reactivate", () => {
    it("should call deactivateCompany when toggle is clicked for active company", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOps.getCompanies)
        .mockResolvedValueOnce(mockCompanies)
        .mockResolvedValueOnce([{ ...mockCompanies[0], isActive: false }, ...mockCompanies.slice(1)]);

      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const powerButtons = screen.getAllByTitle(/Deactivate|Reactivate/);
      await user.click(powerButtons[0]);

      await waitFor(() => {
        expect(adminOps.deactivateCompany).toHaveBeenCalledWith("1");
      });
    });

    it("should call reactivateCompany when toggle is clicked for inactive company", async () => {
      const user = userEvent.setup();
      vi.mocked(adminOps.getCompanies)
        .mockResolvedValueOnce(mockCompanies)
        .mockResolvedValueOnce([mockCompanies[0], { ...mockCompanies[1], isActive: true }]);

      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Global Health")).toBeDefined();
      });

      const powerButtons = screen.getAllByTitle(/Deactivate|Reactivate/);
      await user.click(powerButtons[1]);

      await waitFor(() => {
        expect(adminOps.reactivateCompany).toHaveBeenCalledWith("2");
      });
    });
  });

  describe("Edit company dialog", () => {
    it("should open edit dialog and update company", async () => {
      const user = userEvent.setup();
      const updatedCompany: Company = {
        ...mockCompanies[0],
        name: "Updated Acme",
        country: "KSA",
      };

      vi.mocked(adminOps.updateCompany).mockResolvedValue(updatedCompany);
      vi.mocked(adminOps.getCompanies)
        .mockResolvedValueOnce(mockCompanies)
        .mockResolvedValueOnce([updatedCompany, ...mockCompanies.slice(1)]);

      render(<AdminCompanies />);
      await waitFor(() => {
        expect(screen.getByText("Acme Insurance")).toBeDefined();
      });

      const editButtons = screen.getAllByTitle(/Edit/);
      await user.click(editButtons[0]);

      expect(screen.getByText("Edit Company")).toBeDefined();

      const nameInput = screen.getByDisplayValue("Acme Insurance") as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, "Updated Acme");

      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      await waitFor(() => {
        expect(adminOps.updateCompany).toHaveBeenCalledWith("1", {
          name: "Updated Acme",
          country: "UAE",
          insuranceType: "motor",
          maxUserSlots: 10,
        });
      });
    });
  });

  describe("Error handling", () => {
    it("should handle load error gracefully", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(adminOps.getCompanies).mockRejectedValue(new Error("Load failed"));

      render(<AdminCompanies />);
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });
});
