import { describe, expect, test } from "vitest";

function filterCompleted(tasks) {
  return tasks.filter(task => task.completed);
}

describe("Filtro de tareas", () => {
  test("devuelve solo tareas completadas", () => {

    const tasks = [
      { completed: true },
      { completed: false }
    ];

    expect(filterCompleted(tasks)).toHaveLength(1);
  });
});