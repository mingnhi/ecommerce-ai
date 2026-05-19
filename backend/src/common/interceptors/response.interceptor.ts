import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@common/interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | T
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T> | T> {
    return next.handle().pipe(
      map(data => {
        // Service tự return envelope: bổ sung `success` nếu thiếu (Nhi/Tiến chỉ set `status`)
        if (
          data &&
          typeof data === 'object' &&
          'status' in data &&
          'message' in data &&
          'data' in data
        ) {
          if (!('success' in data)) {
            (data as any).success = (data as any).status === 'success';
          }
          return data;
        }
        return {
          success: true,
          status: 'success',
          message: 'Request successful',
          data,
          meta: {},
        };
      })
    );
  }
}
