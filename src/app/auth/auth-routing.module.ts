import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuestGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PageResolver } from '../shared/common/page.resolver';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [GuestGuard],
    data: { title: 'Login', breadcrumb: 'Login', page_slug: 'login' },
    resolve: {metaInfo: PageResolver},
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard],
    data: { title: 'Register', breadcrumb: 'Register', page_slug: 'register' },
    resolve: {metaInfo: PageResolver},
  },
  { path: 'reset/:token', component: ResetPasswordComponent, canActivate: [GuestGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
