import { Budget, BudgetCategory, Category, CreateCategoryBudgetDto, CreateCategoryDto, Family } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class CategoryService {
    
    constructor(
    @Inject('CategoryRepository') private readonly categoryRepository: Repository<Category>,
    @Inject('BudgetCategoryRepository') private readonly budgetCategoryRepository: Repository<BudgetCategory>,
    private readonly userService: UserService
    ) {}

    async fetchCategoriesForUser(userId: string): Promise<Category[]> {
        const family = await this.userService.findFamilyForUser(userId) as Family;
        return (family.categories as Category[]).sort((a, b) => a.type - b.type) as Category[];
    }

    async findCategoryById(categoryId: string): Promise<Category> {
        return await this.categoryRepository.findOne({ where: { id: categoryId } }) as Category;
    }

    async createCategories(userId: string, categories: Array<CreateCategoryDto>) {
        const user = await this.userService.findById(userId);
        
        await categories.forEach(async category => {
            const newCategory = this.categoryRepository.create({
                name: category.name,
                type: category.type,
                family: user.family
            });
            await this.categoryRepository.save(newCategory);
        });

        return await this.fetchCategoriesForUser(userId);
    }

    async createCategoryForBudget(budget: Budget, category: CreateCategoryBudgetDto) {
        await this.budgetCategoryRepository.save({
            amount: (category.amount as number),
            budget: budget,
            category: await this.findCategoryById(category.id)
        });
        return await this.budgetCategoryRepository.find({ where: { budget: budget } }) as BudgetCategory[];
    }

    async getCategoriesForBudget(budget: Budget): Promise<BudgetCategory[]> {
        return await this.budgetCategoryRepository.find({ where: { budget: budget }, relations: ['category'] }) as BudgetCategory[];
    };
}
