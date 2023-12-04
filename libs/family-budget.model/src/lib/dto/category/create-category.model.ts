import { CategoryType } from "../../entities/category.model";

// export interface CreateCategoryDto {
//     categoryName: string;
//     categoryType: CategoryType;
//     categoryIcon: string;
// }

export class CreateCategoryDto {
    id: string;
    categoryName: string;
    categoryType: CategoryType;
    icon: string;
}