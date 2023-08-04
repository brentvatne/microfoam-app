export type ChangeEventPayload = {
  [key: string]: string;
};

export type ThemeChangeEventPayload = {
  theme: Theme;
};

export enum Theme {
  Light = "light",
  Dark = "dark",
  System = "system",
}
