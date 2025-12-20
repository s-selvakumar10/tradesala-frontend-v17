import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';

if (environment.production || environment.staging) {
  enableProdMode();
}

export { AppServerModule as default } from './app/app.server.module';
