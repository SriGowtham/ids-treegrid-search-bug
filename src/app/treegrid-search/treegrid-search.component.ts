/// <reference types="ids-enterprise-typings" />

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SohoComponentsModule,
  SohoDataGridComponent
} from 'ids-enterprise-ng';

export interface MockProcessRow {
  id: string;
  name: string;
  type: string;
  version: string;
  global_namespace: string;
  status: string;
  expanded?: boolean;
  children?: MockProcessRow[];
}

export const MOCK_LANGUAGE = {
  keyword_placeholder: 'Search processes...',
  process_name: 'Process Name',
  process_type: 'Process Type',
  process_version_label: 'Version',
  process_global_package_namespaces: 'Global Package Namespace',
  process_status_label: 'Status'
};

@Component({
  selector: 'app-treegrid-search',
  standalone: true,
  imports: [
    CommonModule,
    SohoComponentsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './treegrid-search.component.html',
  styleUrls: ['./treegrid-search.component.css']
})
export class TreegridSearchComponent
  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('treeGrid', { static: false })
  treeGrid?: SohoDataGridComponent;

  datagridOptions: SohoDataGridOptions | null = null;

  mockTreeData: MockProcessRow[] = [];

  appLanguage = MOCK_LANGUAGE;
  searchTooltipText = 'Search';
  isBusy = false;

  private resizeTimer?: ReturnType<typeof setTimeout>;

  constructor(private readonly ngZone: NgZone) {}

  ngOnInit(): void {
    this.setupMockTreeData();
    this.setupGridOptions();
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.resizeTimer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  private setupMockTreeData(): void {
    this.mockTreeData = Array.from(
      { length: 15 },
      (_, index): MockProcessRow => {
        const number = index + 1;
        const parentId =
          `process-${String(number).padStart(2, '0')}`;

        const name = this.getProcessName(number);
        const namespace = `test.process${number}`;

        return {
          id: parentId,
          name,
          type: 'Serverless',
          version: '3.0.0',
          global_namespace: namespace,
          status: 'finalized',
          expanded: false,

          children: ['2.0.0', '1.0.0'].map(
            (version): MockProcessRow => ({
              id: `${parentId}-version-${version}`,
              name,
              type: 'Serverless',
              version,
              global_namespace: namespace,
              status: 'deactivated'
            })
          )
        };
      }
    );
  }

  private getProcessName(number: number): string {
    if (number === 1) {
      return 'Sample-Servless-Test-Ms';
    }

    if (number === 12) {
      return 'Asynchronous OCR 2026_10-';
    }

    return `Test Process ${String(number).padStart(2, '0')}`;
  }

  private setupGridOptions(): void {
    this.datagridOptions = {
      columns: this.getColumns(),

      dataset: this.mockTreeData,

      treeGrid: true,
      selectable: 'mixed',
      clickToSelect: false,

      paging: true,
      pagesize: 5,
      pagesizes: [5, 10, 15],

      rowHeight: 'medium',
      isList: true,
      enableTooltips: true,

      toolbar: {
        collapsibleFilter: true,
        results: true,
        keywordFilter: true,
        actions: true,
        rowHeight: true
      }
    };
  }

  protected getColumns(): SohoDataGridColumn[] {
    return [
      {
        id: 'selectionCheckbox',
        sortable: false,
        resizable: false,
        formatter: Soho.Formatters.SelectionCheckbox,
        align: 'center',
        exportable: false,
        width: 45
      },
      {
        id: 'rpa-process-action',
        sortable: false,
        resizable: false,
        align: 'center',
        width: 39,
        formatter: Soho.Formatters.Tree
      },
      {
        id: 'rpa-prcs-prcsName',
        field: 'name',
        name: this.appLanguage.process_name,
        sortable: true,
        resizable: false,
        textOverflow: 'ellipsis',
        expandOnActivate: true,
        formatter: Soho.Formatters.Text,
        minWidth: 120,
        maxWidth: 200,
        searchable: true,
        filterType: 'text',
        filterConditions: [
          'contains',
          'equals',
          'does-not-equal'
        ]
      },
      {
        id: 'rpa-prcs-prcsType',
        field: 'type',
        name: this.appLanguage.process_type,
        sortable: true,
        resizable: false,
        textOverflow: 'ellipsis',
        formatter: Soho.Formatters.Text,
        searchable: true,
        filterType: 'text',
        filterConditions: [
          'contains',
          'equals'
        ]
      },
      {
        id: 'rpa-prcs-pkgVrsn',
        field: 'version',
        name: this.appLanguage.process_version_label,
        sortable: true,
        resizable: false,
        textOverflow: 'ellipsis',
        searchable: true
      },
      {
        id: 'rpa-prcs-global-namespaces',
        field: 'global_namespace',
        name:
          this.appLanguage.process_global_package_namespaces,
        sortable: false,
        resizable: false,
        textOverflow: 'ellipsis',
        searchable: true,
        minWidth: 150,
        maxWidth: 200,
        formatter: Soho.Formatters.Text
      },
      {
        id: 'rpa-prcs-var-status',
        field: 'status',
        name: this.appLanguage.process_status_label,
        sortable: true,
        resizable: false,
        searchable: true,
        cssClass: 'text-capitalize',
        filterType: 'text',
        filterConditions: [
          'contains',
          'equals'
        ],
        width: 120,
        formatter: Soho.Formatters.Text
      }
    ];
  }

  refresh(): void {
    this.setupMockTreeData();

    if (this.treeGrid) {
      this.treeGrid.updateDataset(this.mockTreeData);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeTimer !== undefined) {
      clearTimeout(this.resizeTimer);
    }
  }
}