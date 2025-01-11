using Microsoft.AspNetCore.Http;
using TaskProject.Domain.Category;
using TaskProject.Domain.Pagging;
using TaskProject.Repositories.Dapper;

namespace TaskProject.Services.Category
{
    public interface ICategoryService
    {
        Task<bool> CreateAsync(CategoryViewModel categoryVM);
        Task<CategoryDetailViewModel> GetByIdAsync(int categoryId);
        Task<CategoryDetailViewModel> UpdateAsync(CategoryDetailViewModel filter);
        Task<PagedResult<CategoryViewListVM>> GetCategoriesPagedAsync(CatergoryFilter filter);
        Task<List<CategoryDropdown>> GetCategoryDropdoen();

        Task<bool> Delete(int CatgoryID);


    }
    public class CategoryService : ICategoryService
    {
        private readonly IDapperRepository _dapperRepo;
        public CategoryService(IDapperRepository dapperRepository)
        {
            _dapperRepo = dapperRepository;
        }
        public async Task<PagedResult<CategoryViewListVM>> GetCategoriesPagedAsync(CatergoryFilter filter)
        {
            var parameters = new
            {
                PageNumber = filter.PageIndex,
                PageSize = filter.PageSize,
                Search = filter.Search,
                SortColumn = filter.SortColumn,
                SortOrder = filter.SortOrder,
                IsActive = filter.IsActive,
            };
            var pagedResult = await _dapperRepo.GetPagedAsync<CategoryViewListVM>(
                "SP_GetCategoryList",
                parameters
            );
            return pagedResult;
        }
        public async Task<bool> CreateAsync(CategoryViewModel categoryVM)
        {
            var CategoryICon = ConvertIFormFileToBase64(categoryVM.Icon);

            var parameters = new
            {
                ParentCategoryID = 0,
                Title = categoryVM.Title,
                Description = categoryVM.Description,
                IsActive = categoryVM.IsActive,
                Icon = CategoryICon
            };
            int r = await _dapperRepo.InsertAsync<int>("Sp_CreateCategory", parameters);
            return r > 0;
        }
        public async Task<CategoryDetailViewModel> GetByIdAsync(int categoryId)
        {
            try
            {
                var parameters = new
                {
                    CategoryID = categoryId,
                };
                var r = await _dapperRepo.ExecuteSingleObjectStoredProcedureAsync<CategoryDetailViewModel>("Sp_GetCategoryById", parameters);
                return r;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<CategoryDetailViewModel> UpdateAsync(CategoryDetailViewModel category)
        {
            var CategoryICon = string.Empty;

            if (category.IconFile != null)
            {
                CategoryICon = ConvertIFormFileToBase64(category.IconFile);
            }
            else
            {
                CategoryICon = category.Icon;
            }

            var parameters = new
            {
                CategoryId = category.CategoryID,
                Name = category.Title,
                Description = category.Description,
                Icon = CategoryICon,
                IsActive = category.IsActive,
            };
            var updatedCategory = await _dapperRepo.ExecuteSingleObjectStoredProcedureAsync<CategoryDetailViewModel>("Sp_UpdateCategory", parameters);

            return updatedCategory;
        }

        public string ConvertIFormFileToBase64(IFormFile file)
        {
            if (file == null)
            {
                throw new ArgumentNullException(nameof(file), "File cannot be null.");
            }

            using (var memoryStream = new MemoryStream())
            {
                file.CopyTo(memoryStream);
                byte[] fileBytes = memoryStream.ToArray();

                string base64String = Convert.ToBase64String(fileBytes);
                return base64String;
            }
        }

        public async Task<List<CategoryDropdown>> GetCategoryDropdoen()
        {
            var dropdown = await _dapperRepo.ExecuteStoredProcedureAsync<CategoryDropdown>("Sp_GetCategoyDropdown");
            return dropdown.ToList();
        }

        public async Task<bool> Delete(int CatgoryID)
        {
            var parameters = new
            {
                CatgoryID = CatgoryID,
            };
            var updatedCategory = await _dapperRepo.ExecuteScalarStoredProcedureAsync<int>("Sp_DeleteCategory", parameters);

            return updatedCategory > 0;
        }
    }
}

