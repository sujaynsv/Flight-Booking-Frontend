import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

/**
 * MAIN.TS: Entry point of the application
 * 
 * Angular 21 way:
 * 1. Import AppComponent (root component)
 * 2. Import appConfig (configuration)
 * 3. bootstrapApplication: start the app with this component and config
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
