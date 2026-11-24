import { describe, expect, test } from "bun:test";
import { selectTaskStats } from "../../src/entities/task/model/tasks-selectors";
import { addCalendarDaysToKey, getLocalDateKey } from "../../src/shared/lib/date";

describe("task statistics selector", () => {
  test("counts completed, active, overdue and review tasks", () => {
    const today = getLocalDateKey();
    const yesterday = addCalendarDaysToKey(new Date(), -1);
    const tomorrow = addCalendarDaysToKey(new Date(), 1);
    const state = {
      tasks: {
        items: [
          { status: "done", dueDate: yesterday },
          { status: "todo", dueDate: yesterday },
          { status: "review", dueDate: today },
          { status: "in-progress", dueDate: tomorrow },
          { status: "todo", dueDate: null },
        ],
      },
    };

    expect(selectTaskStats(state)).toEqual({
      total: 5,
      completed: 1,
      active: 4,
      overdue: 1,
      review: 1,
      completionRate: 20,
    });
  });

  test("returns a zero completion rate for an empty task list", () => {
    expect(selectTaskStats({ tasks: { items: [] } }).completionRate).toBe(0);
  });
});
