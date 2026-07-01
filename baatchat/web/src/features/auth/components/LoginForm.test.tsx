import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { LoginForm } from "./LoginForm";
import { useAuthStore } from "../store";

// Mock layer is active by default (VITE_USE_MOCKS unset → mocks on). The main path is
// passwordless (any email/phone → straight in); a "skipper*/guest*" email is treated as
// password-protected in the mock. The password login lives behind "Log in with password".
// No user is signed in during these tests, so the UI locale falls back to English.

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

describe("LoginForm (passwordless main path)", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("lets a brand-new contact in with just an email (no password)", async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("Email or phone"), "nyperson@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy(), { timeout: 3000 });
    expect(useAuthStore.getState().user?.email).toBe("nyperson@example.com");
  });

  it("lets a contact in with a phone number", async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("Email or phone"), "+47 900 00 000");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy(), { timeout: 3000 });
  });

  it("switches a password-protected account to the password login", async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("Email or phone"), "skipper@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByRole("heading", { name: /log in with password/i })
    ).toBeInTheDocument();
  });
});

describe("LoginForm (password)", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  async function openPasswordLogin() {
    await userEvent.click(screen.getByRole("button", { name: "Log in with password" }));
  }

  it("validates the email before submitting", async () => {
    renderLogin();
    await openPasswordLogin();
    await userEvent.type(screen.getByPlaceholderText("Email address"), "not-an-email");
    await userEvent.type(screen.getByPlaceholderText("Password"), "hunter2pw");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
  });

  it("logs in and stores the session on valid credentials", async () => {
    renderLogin();
    await openPasswordLogin();
    await userEvent.type(screen.getByPlaceholderText("Email address"), "kari@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "hunter2pw");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy(), {
      timeout: 3000,
    });
    expect(useAuthStore.getState().user?.email).toBe("kari@example.com");
  });

  it("reveals the forgot-password flow", async () => {
    renderLogin();
    await openPasswordLogin();
    await userEvent.click(screen.getByRole("button", { name: /forgot password/i }));
    expect(
      await screen.findByRole("heading", { name: /forgot password/i })
    ).toBeInTheDocument();
  });
});
