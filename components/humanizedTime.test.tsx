import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import HumanizedTime from "./humanizedTime"; // Adjust path as needed
import * as useNowModule from "./hooks/use-now"; // To mock useNow

// Helper to set up date mocks
const setupDateMocks = (mockNow: Date) => {
  vi.spyOn(useNowModule, "useNow").mockReturnValue(mockNow);
  vi.useFakeTimers();
  vi.setSystemTime(mockNow);
};

const teardownDateMocks = () => {
  vi.useRealTimers();
  vi.restoreAllMocks();
};

describe("HumanizedTime", () => {
  const baseTime = new Date("2024-07-01T12:00:00Z");

  beforeEach(() => {
    // Default "now" for tests, can be overridden in specific tests
    setupDateMocks(new Date("2024-07-10T12:00:00Z"));
  });

  afterEach(() => {
    teardownDateMocks();
  });

  describe("long format", () => {
    it('renders "just now" for current time', () => {
      setupDateMocks(baseTime); // Make "now" the same as baseTime
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("just now")).toBeInTheDocument();
    });

    it("renders minutes correctly", () => {
      const testNow = new Date("2024-07-01T12:05:00Z");
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
    });

    it("renders hours correctly", () => {
      const testNow = new Date("2024-07-01T15:00:00Z");
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("3 hours ago")).toBeInTheDocument();
    });

    it("renders days correctly", () => {
      const testNow = new Date("2024-07-03T12:00:00Z");
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("2 days ago")).toBeInTheDocument();
    });

    it("renders days and hours correctly (the fixed case)", () => {
      const testNow = new Date("2024-07-03T15:00:00Z"); // 2 days, 3 hours after baseTime
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("2 days, 3 hours ago")).toBeInTheDocument();
    });

    it("renders 1 day, 1 hour correctly", () => {
      const testNow = new Date("2024-07-02T13:00:00Z"); // 1 day, 1 hour after baseTime
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("1 day, 1 hour ago")).toBeInTheDocument();
    });

    it("renders months correctly", () => {
      const testNow = new Date("2024-09-01T12:00:00Z"); // 2 months after baseTime
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("2 months ago")).toBeInTheDocument();
    });

    it("renders years correctly", () => {
      const testNow = new Date("2026-07-01T12:00:00Z"); // 2 years after baseTime
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="long" />);
      expect(screen.getByText("2 years ago")).toBeInTheDocument();
    });
  });

  describe("short format", () => {
    it('renders "now" for current time', () => {
      setupDateMocks(baseTime);
      render(<HumanizedTime time={baseTime} format="short" />);
      expect(screen.getByText("now")).toBeInTheDocument();
    });

    it("renders minutes correctly", () => {
      const testNow = new Date("2024-07-01T12:05:00Z");
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="short" />);
      expect(screen.getByText("5m")).toBeInTheDocument();
    });

    it("renders hours correctly", () => {
      const testNow = new Date("2024-07-01T15:00:00Z");
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="short" />);
      expect(screen.getByText("3h")).toBeInTheDocument();
    });

    it("renders days correctly", () => {
      const testNow = new Date("2024-07-03T12:00:00Z"); // 2 days
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="short" />);
      expect(screen.getByText("2d")).toBeInTheDocument();
    });

    it("renders days and hours correctly", () => {
      const testNow = new Date("2024-07-03T15:00:00Z"); // 2 days, 3 hours
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="short" />);
      expect(screen.getByText("2d 3h")).toBeInTheDocument();
    });

    it("renders months correctly", () => {
      const testNow = new Date("2024-09-01T12:00:00Z");
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="short" />);
      expect(screen.getByText("2mo")).toBeInTheDocument();
    });

    it("renders years correctly", () => {
      const testNow = new Date("2026-07-01T12:00:00Z");
      setupDateMocks(testNow);
      render(<HumanizedTime time={baseTime} format="short" />);
      expect(screen.getByText("2y")).toBeInTheDocument();
    });
  });

  describe("title attribute", () => {
    it("renders the full date as title", () => {
      // Expected format from component: weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
      // For "2024-07-01T12:00:00Z" this should be something like "Monday, July 1, 2024, 12:00:00 PM" (depends on test runner's timezone if not UTC)
      // Let's be flexible with the exact title string due to potential timezone differences in test environments.
      // We'll ensure the key parts are there.
      render(<HumanizedTime time={baseTime} format="short" />);
      const spanElement = screen.getByText("9d"); // Default "now" is 9 days after baseTime
      const title = spanElement.getAttribute("title");
      expect(title).toContain("July 1, 2024");
      expect(title).toMatch(/\d{2}:\d{2}:\d{2} (AM|PM)/); // Matches HH:MM:SS AM/PM
    });

    it("renders title with prefix", () => {
      render(<HumanizedTime time={baseTime} format="short" titlePrefix="Occurred:" />);
      const spanElement = screen.getByText("9d");
      const title = spanElement.getAttribute("title");
      expect(title?.startsWith("Occurred:")).toBe(true);
      expect(title).toContain("July 1, 2024");
    });
  });
});
