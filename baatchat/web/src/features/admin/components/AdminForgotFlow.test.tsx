import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { AdminForgotFlow } from "./AdminForgotFlow";

// Mocks are on by default in tests (VITE_USE_MOCKS unset), so adminResetStart resolves
// without a backend and advances to the code-entry step.
function renderFlow() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AdminForgotFlow onBack={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminForgotFlow", () => {
  it("lets the admin type the 6-digit recovery code", async () => {
    renderFlow();
    await userEvent.type(screen.getByPlaceholderText("Email address"), "bk@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send code" }));

    const codeInput = await screen.findByPlaceholderText("6-digit code");
    await userEvent.type(codeInput, "123456");
    expect(codeInput).toHaveValue("123456");
  });

  it("accepts digits only and ignores whitespace/letters", async () => {
    renderFlow();
    await userEvent.type(screen.getByPlaceholderText("Email address"), "bk@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send code" }));

    const codeInput = await screen.findByPlaceholderText("6-digit code");
    await userEvent.type(codeInput, " 12 ab 34x56 ");
    expect(codeInput).toHaveValue("123456");
  });
});
