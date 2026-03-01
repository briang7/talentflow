declare module 'd3-org-chart' {
  export class OrgChart<T = any> {
    container(el: HTMLElement): this;
    data(data: T[]): this;
    nodeId(fn: (d: T) => string): this;
    parentNodeId(fn: (d: T) => string | null): this;
    nodeWidth(fn: (d: any) => number): this;
    nodeHeight(fn: (d: any) => number): this;
    childrenMargin(fn: (d: any) => number): this;
    compactMarginBetween(fn: (d: any) => number): this;
    siblingsMargin(fn: (d: any) => number): this;
    neighbourMargin(fn: (d: any) => number): this;
    initialZoom(zoom: number): this;
    nodeContent(fn: (d: any, i: number, arr: any[], state: any) => string): this;
    linkUpdate(fn: (d: any, i: number, arr: any[]) => void): this;
    onNodeClick(fn: (d: any) => void): this;
    render(): this;
    update(d: any): this;
    fit(): this;
    zoomIn(): this;
    zoomOut(): this;
    expandAll(): this;
    collapseAll(): this;
    setExpanded(id: string, expanded?: boolean): this;
    setCentered(id: string): this;
    setHighlighted(ids: string[]): this;
    clearHighlighting(): this;
    getChartState(): any;
  }
}
