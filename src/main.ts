/// <reference types="@angular/localize" />

import { enableProdMode } from '@angular/core';
//import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { platformBrowser } from '@angular/platform-browser';

if (environment.production || environment.staging) {
  enableProdMode();
}

//document.addEventListener('DOMContentLoaded', () => {
  // platformBrowserDynamic().bootstrapModule(AppModule)
  // .catch(err => console.error(err));
//});
platformBrowser()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));