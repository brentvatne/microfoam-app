import * as Burnt from "burnt";

export function success(options: {
  title?: string;
  message: string;
  duration?: number;
}) {
  Burnt.alert({
    title: options.title,
    message: options.message,
    preset: "done",
    duration: options.duration ?? 3,
  });
}

export function error(options: {
  title?: string;
  message: string;
  duration?: number;
}) {
  Burnt.alert({
    title: options.title ?? "Error",
    message: options.message,
    preset: "error",
    duration: options.duration ?? 3,
  });
}
