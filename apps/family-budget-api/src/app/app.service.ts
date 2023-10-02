import { SeedService } from '@family-budget/family-budget.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class AppService implements OnApplicationBootstrap {

  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  constructor(
    private seedService: SeedService
  ) { }

  async onApplicationBootstrap() {

    // Seed mock data
    // if (!this.isDevelopment) return;
    // await this.seedService.seed();
  }
}
