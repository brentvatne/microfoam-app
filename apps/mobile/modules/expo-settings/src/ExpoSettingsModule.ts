import { requireNativeModule, NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';
import { ChangeEventPayload, ThemeChangeEventPayload, Theme } from './ExpoSettings.types';

const ExpoSettings = requireNativeModule('ExpoSettings');

export function set(key: string, value: string): void {
  return ExpoSettings.set(key, value);
}

export function get(key: string): string | null {
  return ExpoSettings.get(key);
}

export function getTheme(): Theme {
  return ExpoSettings.getTheme();
}

export function setTheme(theme: Theme): void {
  return ExpoSettings.setTheme(theme);
}

export function addThemeListener(listener: (event: ThemeChangeEventPayload) => void): Subscription {
  return emitter.addListener<ThemeChangeEventPayload>('onChangeTheme', listener);
}

const emitter = new EventEmitter(NativeModulesProxy.ExpoSettings ?? ExpoSettings);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ChangeEventPayload, Theme };
