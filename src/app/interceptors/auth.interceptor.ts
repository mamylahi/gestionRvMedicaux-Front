import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!isPlatformBrowser(this.platformId)) {
      console.log('⏭️ Pas dans le navigateur, skip interceptor');
      return next.handle(req);
    }

    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
      console.log('⏭️ Route auth, skip interceptor');
      return next.handle(req);
    }

    const token = localStorage.getItem('access_token');

    if (token) {
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      return next.handle(authReq);
    }
    return next.handle(req);
  }
}
