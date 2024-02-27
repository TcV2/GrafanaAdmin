import { ButtonVariant } from '@grafana/ui';

export interface ButtonOptions {
  text?: string;
  query?: string;
  datasource?: string;
  variant?: ButtonVariant;
}

export interface Options {
  tab: string;
  proxy: string;
}

export interface OrderBookPanelOptions {
  width: number;
  height: number;
}
