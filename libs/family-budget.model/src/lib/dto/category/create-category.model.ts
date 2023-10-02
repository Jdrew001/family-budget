import { CategoryType } from "../../entities/category.model";

export interface CreateCategoryDto {
    name: string;
    type: CategoryType;
}