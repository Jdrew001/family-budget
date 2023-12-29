import { GenericException } from '@family-budget/family-budget.model';
import * as Sentry from "@sentry/node";

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((exception) => {
        // If it is not a generic exception, it is an unexpected exception and we should log it
        if (!this.isGenericException(exception)) {
          Sentry.captureException(exception);
          Logger.error(`EXCEPTION: ${exception.code} - ${exception.message}`);
          throw new GenericException(null, exception.code);
        }
        return throwError(() => exception);
      })
    );
  }

  private isGenericException(err: any): boolean {
    return err instanceof GenericException;
  }
}
