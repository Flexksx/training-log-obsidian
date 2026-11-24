import type { Draft } from "./draft.ts";

export type LoggerState = Readonly<{
  activeExercise: string | undefined;
  isAdding: boolean;
  query: string;
  drafts: Readonly<Record<string, Readonly<Draft>>>;
}>;

export type LoggerAction =
  | { type: "select"; name: string }
  | { type: "openAdd" }
  | { type: "closeAdd" }
  | { type: "changeQuery"; query: string }
  | { type: "saveDraft"; name: string; draft: Readonly<Draft> }
  | { type: "exerciseAdded"; name: string };

export const initialLoggerState = (): LoggerState => ({
  activeExercise: undefined,
  isAdding: false,
  query: "",
  drafts: {},
});

export const updateLoggerState = (state: LoggerState, action: LoggerAction): LoggerState => {
  switch (action.type) {
    case "select":
      return { ...state, activeExercise: action.name };
    case "openAdd":
      return { ...state, isAdding: true, query: "" };
    case "closeAdd":
      return { ...state, isAdding: false, query: "" };
    case "changeQuery":
      return { ...state, query: action.query };
    case "saveDraft":
      return { ...state, drafts: { ...state.drafts, [action.name]: { ...action.draft } } };
    case "exerciseAdded":
      return { ...state, activeExercise: action.name, isAdding: false, query: "" };
  }
};
