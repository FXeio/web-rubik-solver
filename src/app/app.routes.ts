import { Routes, RouterModule } from '@angular/router';

import { SolutionComponent } from './solution/solution.component';
import { ScannerComponent } from './scanner/scanner.component';
import { SettingsComponent } from './settings/settings.component';
import { HomeComponent } from './home/home.component';

const appRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
    data: { title: 'Rubik Solver - Home' },
  },
  {
    path: 'solution',
    component: SolutionComponent,
    data: { title: 'Rubik Solver - Solution' },
  },
  {
    path: 'scanner',
    component: ScannerComponent,
    data: { title: 'Rubik Solver - Scanner' },
  },
  {
    path: 'settings',
    component: SettingsComponent,
    data: { title: 'Rubik Solver - Settings' },
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
