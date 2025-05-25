import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';

import 'prismjs';
import 'prismjs/components/prism-typescript.min.js';
import 'prismjs/components/prism-jsx.min.js';
import 'prismjs/components/prism-ruby.min.js';
import 'prismjs/components/prism-scss.min.js';
import 'prismjs/components/prism-java.min.js';
import 'prismjs/components/prism-csharp.min.js';
import 'prismjs/components/prism-sql.min.js';
import 'prismjs/components/prism-graphql.min.js';
import 'prismjs/components/prism-python.min.js';
import 'prismjs/components/prism-pug.min.js';
import 'prismjs/components/prism-go.min.js';
import 'prismjs/components/prism-rust.min.js';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideMarkdown(),
  ],
};
