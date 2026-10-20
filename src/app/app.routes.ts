import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', redirectTo: 'scan', pathMatch: 'full' },
      {
        path: 'scan',
        loadComponent: () => import('@features/scan/scan-page').then((m) => m.ScanPage),
      },
      {
        path: 'generate',
        loadComponent: () => import('@features/generate/generate-page').then((m) => m.GeneratePage),
      },
      {
        path: 'history',
        loadComponent: () => import('@features/history/history-page').then((m) => m.HistoryPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('@features/settings/settings-page').then((m) => m.SettingsPage),
      },
    ],
  },
];
