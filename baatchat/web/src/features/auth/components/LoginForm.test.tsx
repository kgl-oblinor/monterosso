import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { LoginForm } from "./LoginForm";
import { useAuthStore } from "../store";

// Mock layer is active by default (VITE_USE_MOCKS unset → mocks on). The main path is
// passwordless (any email/phone → straight in); a "skipper*/guest*" email is treated as
// password-protected in the mock. The password login lives behind "Logg inn med passord".

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
    await userEvent.type(screen.getByPlaceholderText("E-post eller telefon"), "nyperson@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy(), { timeout: 3000 });
    expect(useAuthStore.getState().user?.email).toBe("nyperson@example.com");
  });

  it("lets a contact in with a phone number", async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("E-post eller telefon"), "+47 900 00 000");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy(), { timeout: 3000 });
  });

  it("switches a password-protected account to the password login", async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText("E-post eller telefon"), "skipper@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByRole("heading", { name: /logg inn med passord/i })
    ).toBeInTheDocument();
  });
});

describe("LoginForm (password)", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  async function openPasswordLogin() {
    await userEvent.click(screen.getByRole("button", { name: "Logg inn med passord" }));
  }

  it("validates the email before submitting", async () => {
    renderLogin();
    await openPasswordLogin();
    await userEvent.type(screen.getByPlaceholderText("E-postadresse"), "not-an-email");
    await userEvent.type(screen.getByPlaceholderText("Passord"), "hunter2pw");
    await userEvent.click(screen.getByRole("button", { name: "Logg inn" }));
    expect(await screen.findByText(/gyldig e-postadresse/i)).toBeInTheDocument();
  });

  it("logs in and stores the session on valid credentials", async () => {
    renderLogin();
    await openPasswordLogin();
    await userEvent.type(screen.getByPlaceholderText("E-postadresse"), "kari@example.com");
    await userEvent.type(screen.getByPlaceholderText("Passord"), "hunter2pw");
    await userEvent.click(screen.getByRole("button", { name: "Logg inn" }));

    await waitFor(() => expect(useAuthStore.getState().token).toBeTruthy(), {
      timeout: 3000,
    });
    expect(useAuthStore.getState().user?.email).toBe("kari@example.com");
  });

  it("reveals the forgot-password flow", async () => {
    renderLogin();
    await openPasswordLogin();
    await userEvent.click(screen.getByRole("button", { name: /glemt passord/i }));
    expect(
      await screen.findByRole("heading", { name: /glemt passord/i })
    ).toBeInTheDocument();
  });
});
