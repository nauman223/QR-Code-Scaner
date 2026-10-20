import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Icon, type IconName } from '@shared/components/icon/icon';

interface TabBarItem {
  readonly path: string;
  readonly label: string;
  readonly icon: IconName;
}

const TABS: readonly TabBarItem[] = [
  { path: '/scan', label: 'Scan', icon: 'scan' },
  { path: '/generate', label: 'Generate', icon: 'generate' },
  { path: '/history', label: 'History', icon: 'history' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

/**
 * Custom bottom tab bar (Bootstrap/SCSS, not `ion-tab-bar` — UI RULES limit
 * Ionic usage to the app shell and page transitions).
 */
@Component({
  selector: 'app-tab-bar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './tab-bar.html',
  styleUrl: './tab-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBar {
  protected readonly tabs = TABS;
}
