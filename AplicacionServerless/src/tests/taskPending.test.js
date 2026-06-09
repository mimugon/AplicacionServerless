import { describe, expect, test } from "vitest";

function filterPending(tasks) {
  return tasks.filter(task => !task.completed);
}

describe("Filtro pendientes", () => {

  test("devuelve tareas pendientes", () => {

    const tasks = [
      { completed: true },
      { completed: false }
    ];

    expect(filterPending(tasks)).toHaveLength(1);

  });
});