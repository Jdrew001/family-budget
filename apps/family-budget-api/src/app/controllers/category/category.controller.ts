import { BudgetService, CategoryService, CoreService } from '@family-budget/family-budget.service';
import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { CreateCategoryBudgetDto, CreateCategoryDto } from '@family-budget/family-budget.model';

@UseGuards(AccessTokenGuard)
@Controller('category')
export class CategoryController {

    get currentUser() { return this.coreService.currentUser; }
    
    constructor(
        private readonly categoryService: CategoryService,
        private readonly budgetService: BudgetService,
        private readonly coreService: CoreService
    ) {}

    @Get('categoriesForUser')
    async fetchCategoriesForUser(@Req() req: Request) {
        return await this.categoryService.fetchCategoriesForUser(this.currentUser.id);
    }

    @Post('createCategories')
    async createCategories(@Req() req: Request) {
        const categories = req.body as Array<CreateCategoryDto>;
        return await this.categoryService.createCategories(this.currentUser.id, categories);
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

    @Get('deleteCategoryForBudget/:budgetCategoryId')
    async deleteCategoryForBudget(@Param('budgetCategoryId') budgetCategoryId: string) {
        return await this.categoryService.deleteCategoryForBudget(budgetCategoryId);
    }

    @Post('createCategory')
    async createCategory(@Req() req: Request) {
        const category = req.body as CreateCategoryDto;
        return await this.categoryService.createCategory(this.currentUser.id, category);
    }
}
