import { HttpInterceptorFn } from '@angular/common/http';

export const intercepteurInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
