import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { LoginForm } from "./LoginForm";
import { useAuthStore } from "../store";

// Mock layer is active by default (VITE_USE_MOCKS unset → mocks on), so login works
// without a backend (any email + password ≥ 8 chars).

function renderLogin() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/login"]}>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("LoginForm (password)", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("validates the email before submitting", async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("E-postadresse"), "not-an-email");
    await userEvent.type(screen.getByPlaceholderText("Passord"), "hunter2pw");
    await userEvent.click(screen.getByRole("button", { name: "Logg inn" }));
    expect(await screen.findByText(/gyldig e-postadresse/i)).toBeInTheDocument();
  });

  it("logs in and stores the session on valid credentials", async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("E-postadresse"), "kari@oblinor.no");
    await userEvent.type(screen.getByPlaceholderText("Passord"), "hunter2pw");
    await userEvent.click(screen.getByRole("button", { name: "Logg inn" }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy(), {
      timeout: 3000,
    });
    expect(useAuthStore.getState().user?.email).toBe("kari@oblinor.no");
  });

  it("reveals the forgot-password flow", async () => {
    renderLogin();
    await userEvent.click(screen.getByRole("button", { name: /glemt passord/i }));
    expect(
      await screen.findByRole("heading", { name: /glemt passord/i })
    ).toBeInTheDocument();
  });
});
