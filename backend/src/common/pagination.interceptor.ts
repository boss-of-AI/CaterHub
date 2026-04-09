import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // If data is of shape { data: [...], total: number }
        if (data && typeof data === 'object' && 'data' in data && 'total' in data && Array.isArray(data.data)) {
          const res = context.switchToHttp().getResponse<Response>();
          
          if (res) {
            res.header('X-Total-Count', data.total.toString());
            res.header('Access-Control-Expose-Headers', 'X-Total-Count');
          }
          
          return data.data;
        }
        
        return data; // pass-through
      }),
    );
  }
}
