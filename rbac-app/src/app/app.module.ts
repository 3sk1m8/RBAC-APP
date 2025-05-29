import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { fakeBackendInterceptor } from './core/interceptors/fake-backend.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppComponent,
    AppRoutingModule,
    CoreModule,
    SharedModule
  ],
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, fakeBackendInterceptor])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }