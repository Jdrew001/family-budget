import { Category, Family } from '@family-budget/family-budget.model';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { FamilyService } from '../family/family.service';

@Injectable()
export class CategoryService {
    
    constructor(
    @Inject('CategoryRepository') private readonly categoryRepository: Repository<Category>,
    private readonly userService: UserService
    ) {}

    async fetchCategoriesForUser(userId: string): Promise<Category[]> {
        const family = await this.userService.findFamilyForUser(userId) as Family;
        return (family.categories as Category[]).sort((a, b) => a.type - b.type) as Category[];
    }

    async findCategoryById(categoryId: string): Promise<Category> {
        return await this.categoryRepository.findOne({ where: { id: categoryId } }) as Category;
    }
}
