import type { Draft } from "./draft.ts";

export class ExerciseLoggerState {
  #activeExercise = $state<string>();
  #isAdding = $state(false);
  #query = $state("");
  #drafts = $state<Record<string, Draft>>({});

  get activeExercise(): string | undefined {
    return this.#activeExercise;
  }

  get isAdding(): boolean {
    return this.#isAdding;
  }

  get query(): string {
    return this.#query;
  }

  set query(value: string) {
    this.#query = value;
  }

  draftOf(exerciseName: string): Draft | undefined {
    return this.#drafts[exerciseName];
  }

  saveDraft(exerciseName: string, draft: Draft): void {
    this.#drafts[exerciseName] = draft;
  }

  select(exerciseName: string): void {
    this.#activeExercise = exerciseName;
  }

  openAdd(): void {
    this.#isAdding = true;
    this.#query = "";
  }

  closeAdd(): void {
    this.#isAdding = false;
    this.#query = "";
  }

  exerciseAdded(exerciseName: string): void {
    this.#activeExercise = exerciseName;
    this.closeAdd();
  }
}
