export type Presence = {
  cursor: {
    x: number;
    y: number;
  } | null;
  message: string;
  username: string | null;
};

export enum CursorMode {
  Hidden,
  Chat,
  ReactionSelector,
  Reaction,
}

export type CursorState =
  | {
      mode: CursorMode.Hidden;
    }
  | {
      mode: CursorMode.Chat;
      message: string;
      previousMessage: string | null;
    }
  | {
      mode: CursorMode.ReactionSelector;
    }
  | {
      mode: CursorMode.Reaction;
      reaction: string;
      isPressed: boolean;
    };

export type Comment = {
  id: number;
  value: string;
  commentTimestamp: number;
  point: { x: number; y: number };
  color: string;
  username: string;
  likes: string;
};

export type Reaction = {
  value: string;
  timestamp: number;
  point: { x: number; y: number };
};
