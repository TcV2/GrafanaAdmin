import { PanelPlugin } from '@grafana/data';
import { MainPanel } from './mainPanel';
import { addEditor } from './editor';
import { Options } from './types';
import { loadPluginCss } from '@grafana/runtime';

loadPluginCss({
  dark: 'plugins/koha-Button/css/style.css',
  light: 'plugins/koha-Button/css/style-light.css',
});

export const plugin = new PanelPlugin<Options>(MainPanel);

plugin.setPanelOptions((builder) => addEditor(builder));
