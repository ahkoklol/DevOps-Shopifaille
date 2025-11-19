import { CreateCategoryDto, StoreCategory } from "../store.type.ts";
import { CategoryRepository } from "../repositories/category.repository.ts";

export class CategoryService {
  private repo = new CategoryRepository();

  async createCategory(storeId: string, dto: CreateCategoryDto): Promise<StoreCategory> {
    return await this.repo.create(storeId, dto);
  }

  async listCategories(storeId: string): Promise<StoreCategory[]> {
    return await this.repo.list(storeId);
  }

  async deleteCategory(id: string): Promise<void> {
    return await this.repo.delete(id);
  }
}
