import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';


import { NgxPaginationModule } from 'ngx-pagination';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { ClientModule } from './client/client.module';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { DecimalPipe } from '@angular/common';
import { UnauthorizedComponent } from './Plateforme/unauthorized/unauthorized.component';
//import { ClientModule } from './client/client.module';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    ClientModule,
    AppRoutingModule, 
    RouterModule,
    HttpClientModule,
    FormsModule,
    UnauthorizedComponent,

    NgxPaginationModule,

    RouterModule.forRoot(routes)
  ],
 providers: [
    { provide: HTTP_INTERCEPTORS, useValue: AuthInterceptor, multi: true },DecimalPipe
  ],  bootstrap: []
})
export class AppModule { }
