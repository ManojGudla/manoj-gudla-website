export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Changes on every submit so the UI can re-announce identical messages. */
  at?: number;
};

export const initialState: ActionState = { ok: false };
