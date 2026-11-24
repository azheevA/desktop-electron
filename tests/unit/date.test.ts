import { describe, expect, test } from "bun:test";
import {
  addCalendarDays,
  addCalendarDaysToKey,
  getLocalDateKey,
} from "../../src/shared/lib/date";

describe("local calendar date helpers", () => {
  test("formats a date using local calendar fields instead of UTC", () => {
    const date = new Date(2026, 0, 2, 0, 15, 0);

    expect(getLocalDateKey(date)).toBe("2026-01-02");
  });

  test("adds calendar days across month and year boundaries", () => {
    expect(addCalendarDaysToKey(new Date(2026, 0, 31, 12), 1)).toBe(
      "2026-02-01",
    );
    expect(addCalendarDaysToKey(new Date(2026, 11, 31, 12), 1)).toBe(
      "2027-01-01",
    );
  });

  test("does not mutate the input date", () => {
    const source = new Date(2026, 5, 10, 12);
    const result = addCalendarDays(source, 3);

    expect(getLocalDateKey(source)).toBe("2026-06-10");
    expect(getLocalDateKey(result)).toBe("2026-06-13");
    expect(result).not.toBe(source);
  });
});
