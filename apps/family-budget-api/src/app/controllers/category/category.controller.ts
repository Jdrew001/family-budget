import { BudgetService, CategoryService } from '@family-budget/family-budget.service';
import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { CreateCategoryBudgetDto, CreateCategoryDto } from '@family-budget/family-budget.model';

@UseGuards(AccessTokenGuard)
@Controller('category')
export class CategoryController {
    
    constructor(
        private readonly categoryService: CategoryService,
        private readonly budgetService: BudgetService
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

    @Post('createCategoryForBudget')
    async createCategoryForBudget(@Req() req: Request) {
        const data = req.body as {budgetId: string, category: CreateCategoryBudgetDto};
        const formattedAmount = (data.category.amount as string).replace(/[$,]/g, "")

        const formattedData = {
            budgetId: data.budgetId,
            category: {
                id: data.category.id,
                amount: parseFloat(formattedAmount)
            }
        };

        const budget = await this.budgetService.getBudgetById(data.budgetId);
        return await this.categoryService.createCategoryForBudget(budget, formattedData.category);
    }

    @Post('updateCategoryForBudget')
    async updateCategoryForBudget(@Req() req: Request) {
        const data = req.body as {budgetCategoryId: string, category: CreateCategoryBudgetDto};
        const formattedAmount = (data.category.amount as string).replace(/[$,]/g, "");
        const formattedData = {
            budgetCategoryId: data.budgetCategoryId,
            category: {
                id: data.category.id,
                amount: parseFloat(formattedAmount)
            }
        };
        
        return await this.categoryService.updateCategoryForBudget(data.budgetCategoryId, formattedData.category);
    }

    @Post('createCategory')
    async createCategory(@Req() req: Request) {
        const userId = req.user['sub'];
        const category = req.body as CreateCategoryDto;
        return await this.categoryService.createCategory(userId, category);
    }
}
