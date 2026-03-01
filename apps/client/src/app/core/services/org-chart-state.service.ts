import { Injectable } from '@angular/core';

/**
 * Persists org chart UI state (expanded nodes) across navigations
 * so users can return to the chart in the same state they left it.
 */
@Injectable({ providedIn: 'root' })
export class OrgChartStateService {
  private expandedNodeIds: Set<string> | null = null;

  save(ids: Set<string>): void {
    this.expandedNodeIds = new Set(ids);
  }

  restore(): Set<string> | null {
    return this.expandedNodeIds;
  }

  clear(): void {
    this.expandedNodeIds = null;
  }
}
