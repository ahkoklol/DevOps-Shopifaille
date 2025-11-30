// category.service.ts
import { CreateCategoryDto, StoreCategory } from "../store.type.ts";
import type { CategoryRepository } from "../repositories/category.repository.ts";

export class CategoryService {
  constructor(private repo: CategoryRepository) {}

  createCategory(
    storeId: string,
    dto: CreateCategoryDto,
  ): Promise<StoreCategory> {
    return this.repo.create(storeId, dto);
  }

  listCategories(storeId: string): Promise<StoreCategory[]> {
    return this.repo.list(storeId);
  }

  deleteCategory(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
