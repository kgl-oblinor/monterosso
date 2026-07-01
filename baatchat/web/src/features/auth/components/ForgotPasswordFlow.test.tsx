import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

import { ForgotPasswordFlow } from "./ForgotPasswordFlow";
import { MOCK_OTP_CODE } from "@/mocks/fixtures";

// Mocks on by default → register/start + register/complete resolve without a backend.
function renderFlow() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ForgotPasswordFlow onBack={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ForgotPasswordFlow (user reset)", () => {
  it("code field is digits-only (whitespace/letters ignored) and password accepts input", async () => {
    renderFlow();
    await userEvent.type(screen.getByPlaceholderText("Email address"), "kari@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send code" }));

    const codeInput = await screen.findByPlaceholderText("6-digit code");
    await userEvent.type(codeInput, ` 12 ab 34x56 `); // whitespace + letters stripped
    expect(codeInput).toHaveValue(MOCK_OTP_CODE);

    const pwInput = screen.getByPlaceholderText("New password");
    await userEvent.type(pwInput, "hunter2pw");
    expect(pwInput).toHaveValue("hunter2pw");
  });
});
