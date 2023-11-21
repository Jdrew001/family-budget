import { CategoryType } from "../../entities/category.model";

export interface CreateCategoryDto {
    categoryName: string;
    categoryType: CategoryType;
    categoryIcon: string;
}