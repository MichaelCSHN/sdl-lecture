declare module 'react-plotly.js' {
  import { Component } from 'react';
  import type { Layout, Config, Data } from 'plotly.js';

  interface PlotParams {
    data: Data[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: Readonly<{ data: Data[]; layout: Partial<Layout> }>, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Readonly<{ data: Data[]; layout: Partial<Layout> }>, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Readonly<{ data: Data[]; layout: Partial<Layout> }>, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
  }

  export default class Plot extends Component<PlotParams> {}
}
