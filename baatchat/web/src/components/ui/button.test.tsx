import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./button";

describe("Button", () => {
  it("renders its label and fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send code</Button>);

    const btn = screen.getByRole("button", { name: "Send code" });
    await userEvent.click(btn);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Verify
      </Button>
    );

    await userEvent.click(screen.getByRole("button", { name: "Verify" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
