import { initialLoggerState, type LoggerAction, type LoggerState, updateLoggerState } from "./logger-state.ts";

export class ExerciseLoggerState {
  #value = $state.raw<LoggerState>(initialLoggerState());

  get value(): LoggerState {
    return this.#value;
  }

  dispatch(action: LoggerAction): void {
    this.#value = updateLoggerState(this.#value, action);
  }
}
