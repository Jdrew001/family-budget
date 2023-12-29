import { UserService } from '@family-budget/family-budget.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CoreService } from 'libs/family-budget.service/src/lib/core/core.service';
import { Observable } from 'rxjs';

@Injectable()
export class UserInterceptor implements NestInterceptor {

  constructor(
    private readonly coreService: CoreService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) return next.handle();
    const userId = request.user['sub'];// Assuming 'sub' is the user ID property in the token
    await this.coreService.fetchUserInfo(userId);
    return next.handle();
  }
}
