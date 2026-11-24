import { useDispatch, useSelector } from "react-redux";
import type { Dispatch } from "redux";

type AppAction = {
  type: string;
  payload?: unknown;
  meta?: unknown;
  error?: unknown;
};

export function useAppDispatch() {
  return useDispatch<Dispatch<AppAction>>();
}

export function useAppSelector<State, Selected>(
  selector: (state: State) => Selected,
): Selected {
  return useSelector<State, Selected>(selector);
}
