import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

(globalThis as typeof globalThis & { global?: typeof globalThis }).global ??= globalThis;

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
