/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function pendingFetch() {
  vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(() => undefined)));
}

describe("FuseOps console", () => {
  it("exposes the selected run mode to assistive technology", () => {
    pendingFetch();
    render(<App />);

    const live = screen.getByRole("button", { name: "Live harness" });
    const replay = screen.getByRole("button", { name: "Demo replay" });

    expect(replay).toHaveAttribute("aria-pressed", "true");
    expect(live).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(live);

    expect(live).toHaveAttribute("aria-pressed", "true");
    expect(replay).toHaveAttribute("aria-pressed", "false");
  });

  it("cancels replay updates when the operator switches to live mode", async () => {
    vi.useFakeTimers();
    pendingFetch();
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Run investigation" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(350);
    });
    expect(screen.getByText("2 events")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Live harness" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });

    expect(screen.getByText("2 events")).toBeInTheDocument();
    expect(screen.queryByText("Allow rollback_deployment?")).not.toBeInTheDocument();
  });

  it("announces and focuses the approval checkpoint", async () => {
    vi.useFakeTimers();
    render(<App />);

    const runButton = screen.getByRole("button", { name: "Run investigation" });
    fireEvent.click(runButton);
    expect(runButton).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });

    const approval = screen.getByRole("region", { name: "Allow rollback_deployment?" });
    expect(approval).toHaveAttribute("aria-live", "assertive");
    expect(approval).toHaveFocus();
    expect(document.getElementById("replay-progress")).toHaveTextContent(
      "Human approval is required before rollback.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Deny" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByRole("heading", { name: "Payments are failing." })).toBeInTheDocument();
    expect(screen.getByText("18.4%")).toBeInTheDocument();
    expect(screen.getByText("v43")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Allow rollback_deployment?" })).not.toBeInTheDocument();
    expect(screen.queryByText("Checkout recovered.")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run investigation" })).toHaveFocus();
  });

  it("marks unverified metrics stale and catches a failed reset", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/v1/capabilities")) {
        return Promise.resolve({ ok: true } as Response);
      }
      if (url.includes("/api/reset") && init?.method === "POST") {
        return Promise.reject(new Error("reset unavailable"));
      }
      return Promise.reject(new Error("snapshot unavailable"));
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Live harness" }));

    await waitFor(() => {
      expect(screen.getByText("Live snapshot unavailable.")).toBeInTheDocument();
      expect(screen.getByText("TrueForge reachable")).toBeInTheDocument();
    });
    expect(screen.getByRole("region", { name: "Service health — unverified demo snapshot" })).toHaveAttribute(
      "aria-busy",
      "false",
    );
    expect(screen.getByText("Select FuseOps Commander and confirm 6 MCP tools before sending the demo prompt.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset scenario" }));
    await waitFor(() => {
      expect(screen.getByText(/Scenario reset failed/)).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3100/api/reset",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
