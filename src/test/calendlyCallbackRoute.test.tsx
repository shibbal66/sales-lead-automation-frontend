import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CalendlyCallback from "@/pages/auth/CalendlyCallback";

const redirectMock = vi.fn();

vi.mock("@/lib/calendlyAuth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/calendlyAuth")>();
  return {
    ...actual,
    redirectToCalendlyApiCallback: (...args: unknown[]) => redirectMock(...args)
  };
});

describe("CalendlyCallback route", () => {
  beforeEach(() => {
    redirectMock.mockReset();
  });

  it("forwards valid OAuth params to the API callback", () => {
    render(
      <MemoryRouter initialEntries={["/auth/calendly/callback?code=abc&state=xyz"]}>
        <Routes>
          <Route path="/auth/calendly/callback" element={<CalendlyCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Completing Calendly connection/i)).toBeInTheDocument();
    expect(redirectMock).toHaveBeenCalledTimes(1);

    const params = redirectMock.mock.calls[0][0] as URLSearchParams;
    expect(params.get("code")).toBe("abc");
    expect(params.get("state")).toBe("xyz");
  });
});
