import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { HttpClientModule, HttpClientXsrfModule, provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule} from './app-routing.module';
import { AppComponent } from './app.component';

import { DefaultComponent } from './layout/default/default.component';

import { HeaderComponent } from './header/header.component';
import { DropdownCartComponent } from './header/dropdown-cart/dropdown-cart.component';
import { CollapseCatMenuComponent } from './header/collapse-cat-menu/collapse-cat-menu.component';
import { SearchComponent } from './header/search/search.component';
import { FooterComponent } from './footer/footer.component';
import { SharedModule } from './shared/shared.module';
import { WINDOW_PROVIDERS } from './shared/services/window.service';
import { AuthInterceptorProvider } from './core/interceptors/auth.interceptor';
import { LoaderInterceptorProvider } from './core/interceptors/loader.interceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgScrollbarModule } from 'ngx-scrollbar';
//import { BackendInterceptorProvider } from './core/interceptors/backend.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    DefaultComponent,
    HeaderComponent,
    FooterComponent,
    DropdownCartComponent,
    CollapseCatMenuComponent,
    SearchComponent,
  ],
  imports: [    
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,    
    FontAwesomeModule,
    SharedModule,
    NgScrollbarModule,
    ToastrModule.forRoot({     
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [    
    WINDOW_PROVIDERS,
    AuthInterceptorProvider,
    //BackendInterceptorProvider,
    //LoaderInterceptorProvider,
    {
      provide: 'isServer',
      useValue: false
    },
    provideClientHydration(
      withHttpTransferCacheOptions({
        includeHeaders: ['ETag', 'Cache-Control'],
        filter: (req) => !req.url.includes('/v1'),
        includePostRequests: true,
      }),
    ),
    provideHttpClient(
      withFetch()
      // withInterceptors([
      //   httpCacheInterceptor(),
      // ])
    ),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
