import { Routes, RouterModule } from '@angular/router';

import { SolutionComponent } from './solution/solution.component';
import { ScannerComponent } from './scanner/scanner.component';
import { SettingsComponent } from './settings/settings.component';

const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: SolutionComponent,
    data: { title: 'Rubik Solver' },
  },
  {
    path: 'scanner',
    component: ScannerComponent,
    data: { title: 'Scanner' },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: { title: 'Settings' },
  },
  {
    path: '**',
    redirectTo: ''
  }
];

export const AppRoutes = RouterModule.forRoot(
  appRoutes,
  // debugging purposes only
  // { enableTracing: true }
);
