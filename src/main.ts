import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import '@angular/localize/init';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';

// Enregistrer les données de localisation pour le français
registerLocaleData(localeFr, 'fr-FR', localeFrExtra);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(HttpClientModule),
    { provide: LOCALE_ID, useValue: 'fr-FR' } // Ajoutez cette ligne
  ]
}).catch((err) => console.error(err));