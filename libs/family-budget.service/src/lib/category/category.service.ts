import { Budget, BudgetCategory, Category, CreateCategoryBudgetDto, CreateCategoryDto, Family, GenericResponseModel } from '@family-budget/family-budget.model';
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

    async createCategory(userId: string, category: CreateCategoryDto) {
        const user = await this.userService.findById(userId);
        const categories = await this.fetchCategoriesForUser(userId);

        const duplicateCategory = categories.find(c => c.name.toLowerCase() === category.categoryName.toLowerCase());
        if (duplicateCategory) {
            return new GenericResponseModel(false, 'Category already exists');
        }

        const duplicateIcon = categories.find(c => c.icon === category.icon);
        if (duplicateIcon) {
            return new GenericResponseModel(false, `Icon already exists for ${duplicateIcon.name} category`);
        }

        await this.categoryRepository.save({
            name: category.categoryName,
            type: category.categoryType,
            icon: category.icon,
            family: user.family
        });
        const nCategories = await this.fetchCategoriesForUser(userId);
        return new GenericResponseModel(true, 'Category created successfully', 200, nCategories);
    }

    async createCategories(userId: string, categories: Array<CreateCategoryDto>) {
        const user = await this.userService.findById(userId);
        
        await categories.forEach(async category => {
            const newCategory = this.categoryRepository.create({
                name: category.categoryName,
                type: category.categoryType,
                icon: category.icon,
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

    async updateCategoryForBudget(budgetId: string, categoryDto: CreateCategoryBudgetDto) {
        const budgetCategory = await this.budgetCategoryRepository.findOne({ where: { id: categoryDto.id, budget: {id: budgetId} } }) as BudgetCategory;

        if (budgetCategory) {
            budgetCategory.amount = categoryDto.amount as number;
            return await this.budgetCategoryRepository.save(budgetCategory);
        }

        return null;
    }

    async deleteCategoryForBudget(budgetCategoryId: string) {
        const budgetCategory = await this.budgetCategoryRepository.findOne({ where: { id: budgetCategoryId } }) as BudgetCategory;
        await this.budgetCategoryRepository.remove(budgetCategory);
        return await this.budgetCategoryRepository.find({ where: { budget: budgetCategory.budget } }) as BudgetCategory[];
    }

    async getCategoriesForBudget(budget: Budget): Promise<BudgetCategory[]> {
        return await this.budgetCategoryRepository.find({ where: { budget: budget }, relations: ['category'] }) as BudgetCategory[];
    };
}
