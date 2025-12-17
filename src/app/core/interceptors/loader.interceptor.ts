import { Injectable, Provider } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {catchError, map} from 'rxjs/operators'
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(
    private _loading: LoadingService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   
    if(request.url.match(/cart/)){
      this._loading.setLoading(true, request.url);
      return next.handle(request)
        .pipe(catchError((err) => {
          this._loading.setLoading(false, request.url);
          return err;
        }))
        .pipe(map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
          if (evt instanceof HttpResponse) {
            this._loading.setLoading(false, request.url);
          }
          return evt;
        }));
    }
    return next.handle(request);
    
  }
}

export const LoaderInterceptorProvider: Provider =
  { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true };
