import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';

import { TabBar } from '@layout/tab-bar/tab-bar';

@Component({
  selector: 'app-shell',
  imports: [IonRouterOutlet, TabBar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {}
