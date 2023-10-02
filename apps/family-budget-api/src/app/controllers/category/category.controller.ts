import { CategoryService } from '@family-budget/family-budget.service';
import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { CreateCategoryDto } from '@family-budget/family-budget.model';

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

    @Post('createCategories')
    async createCategories(@Req() req: Request) {
        const userId = req.user['sub'];
        const categories = req.body as Array<CreateCategoryDto>;
        return await this.categoryService.createCategories(userId, categories);
    }
}
