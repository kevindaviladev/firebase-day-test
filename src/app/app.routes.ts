import { Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration';
import { LotteryComponent } from './lottery/lottery';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: RegistrationComponent },
  { path: 'lottery', component: LotteryComponent },
];
