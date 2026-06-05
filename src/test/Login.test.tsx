import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "@/pages/auth/Login";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock("@/services/auth/authServices", () => ({
  login: vi.fn()
}));

vi.mock("@/lib/googleAuth", () => ({
  startGoogleOAuthRedirect: vi.fn()
}));

vi.mock("@/lib/apiToast", () => ({
  showApiErrorToast: vi.fn(),
  showApiSuccessToast: vi.fn(),
  getApiErrorMessage: vi.fn()
}));

vi.mock("@/store/auth/authStore", () => ({
  useAuthStore: (selector: (state: { setCredentials: ReturnType<typeof vi.fn> }) => unknown) =>
    selector({ setCredentials: vi.fn() })
}));

describe("Login page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders sign-in form fields", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty submission", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
