import { CategoryService } from '@family-budget/family-budget.service';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('category')
export class CategoryController {
    
    constructor(
        private readonly categoryService: CategoryService
    ) {}

    @Get('categoriesForUser')
    async fetchCategoriesForUser(@Req() req: Request) {
        const userId = req.user['sub'];
        return await this.categoryService.fetchCategoriesForUser(userId);
    }
}
