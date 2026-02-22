import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard';

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    title: 'Torus K | AI Semantic Translator' 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
