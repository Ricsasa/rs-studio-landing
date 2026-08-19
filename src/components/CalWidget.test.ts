// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CalWidget from "./CalWidget";

const calApiMock = vi.fn();

vi.mock("@calcom/embed-react", () => ({
  getCalApi: vi.fn(async () => calApiMock),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CalWidget rendering", () => {
  it("renders a button with triggerLabel as its text", () => {
    render(createElement(CalWidget, { eventSlug: "team/discovery", triggerLabel: "Schedule", mode: "popup" }));
    expect(screen.getByRole("button", { name: "Schedule" })).toBeInTheDocument();
  });

  it("disables the button and logs a console error when eventSlug is missing", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(createElement(CalWidget, { eventSlug: "", triggerLabel: "Schedule", mode: "popup" }));
    expect(screen.getByRole("button", { name: "Schedule" })).toBeDisabled();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("enables the button when eventSlug is a non-empty string", () => {
    render(createElement(CalWidget, { eventSlug: "team/discovery", triggerLabel: "Schedule", mode: "popup" }));
    expect(screen.getByRole("button", { name: "Schedule" })).toBeEnabled();
  });
});

describe("CalWidget script loading", () => {
  it("loads the SDK exactly once across repeated clicks", async () => {
    const { getCalApi } = await import("@calcom/embed-react");
    render(createElement(CalWidget, { eventSlug: "team/discovery", triggerLabel: "Schedule", mode: "popup" }));
    const button = screen.getByRole("button", { name: "Schedule" });

    fireEvent.click(button);
    await waitFor(() => expect(calApiMock).toHaveBeenCalled());
    fireEvent.click(button);
    await waitFor(() => expect(calApiMock.mock.calls.length).toBeGreaterThan(1));

    expect(getCalApi).toHaveBeenCalledTimes(1);
  });

  it("opens the modal scoped to eventSlug with prefill omitted when not provided", async () => {
    render(createElement(CalWidget, { eventSlug: "team/discovery", triggerLabel: "Schedule", mode: "popup" }));
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    await waitFor(() =>
      expect(calApiMock).toHaveBeenCalledWith(
        "modal",
        expect.objectContaining({ calLink: "team/discovery", config: {} }),
      ),
    );
  });
});

describe("CalWidget theming", () => {
  it("passes theme.brandColor and theme.borderRadius through to the ui config", async () => {
    render(
      createElement(CalWidget, {
        eventSlug: "team/discovery",
        triggerLabel: "Schedule",
        mode: "popup",
        theme: { brandColor: "#000000", borderRadius: 0 },
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    await waitFor(() =>
      expect(calApiMock).toHaveBeenCalledWith(
        "ui",
        expect.objectContaining({
          styles: { branding: { brandColor: "#000000" } },
          borderRadius: 0,
        }),
      ),
    );
  });

  it("does not throw when theme is omitted", async () => {
    render(createElement(CalWidget, { eventSlug: "team/discovery", triggerLabel: "Schedule", mode: "popup" }));
    expect(() => fireEvent.click(screen.getByRole("button", { name: "Schedule" }))).not.toThrow();
  });
});

describe("CalWidget prefill mapping", () => {
  it("passes prefillName, prefillEmail, prefillNotes as name/email/notes when provided", async () => {
    render(
      createElement(CalWidget, {
        eventSlug: "team/discovery",
        triggerLabel: "Schedule",
        mode: "popup",
        prefillName: "Ana",
        prefillEmail: "ana@example.com",
        prefillNotes: "Landing page project",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    await waitFor(() =>
      expect(calApiMock).toHaveBeenCalledWith(
        "modal",
        expect.objectContaining({
          config: { name: "Ana", email: "ana@example.com", notes: "Landing page project" },
        }),
      ),
    );
  });

  it("omits prefillEmail and prefillNotes from config when not provided", async () => {
    render(
      createElement(CalWidget, {
        eventSlug: "team/discovery",
        triggerLabel: "Schedule",
        mode: "popup",
        prefillName: "Ana",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    await waitFor(() =>
      expect(calApiMock).toHaveBeenCalledWith("modal", expect.objectContaining({ config: { name: "Ana" } })),
    );
  });
});

describe("CalWidget onOpen", () => {
  it("fires onOpen only after the modal's linkReady event, not before", async () => {
    const onOpen = vi.fn();
    render(
      createElement(CalWidget, { eventSlug: "team/discovery", triggerLabel: "Schedule", mode: "popup", onOpen }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    await waitFor(() =>
      expect(calApiMock).toHaveBeenCalledWith("on", { action: "linkReady", callback: onOpen }),
    );
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("registers onBookingSuccess against the bookingSuccessfulV2 event", async () => {
    const onBookingSuccess = vi.fn();
    render(
      createElement(CalWidget, {
        eventSlug: "team/discovery",
        triggerLabel: "Schedule",
        mode: "popup",
        onBookingSuccess,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Schedule" }));

    await waitFor(() =>
      expect(calApiMock).toHaveBeenCalledWith("on", {
        action: "bookingSuccessfulV2",
        callback: onBookingSuccess,
      }),
    );
  });
});
