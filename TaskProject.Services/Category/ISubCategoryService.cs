using Microsoft.AspNetCore.Http;
using TaskProject.Domain.Pagging;
using TaskProject.Domain.SubCategory;
using TaskProject.Repositories.Dapper;

namespace TaskProject.Services.Category
{
    public interface ISubCategoryService
    {
        Task<PagedResult<SubCategoryViewListVM>> GetSubCategoriesPagedAsync(SubCatergoryFilter filter);
        Task<bool> CreateAsync(SubCategoryViewModel subCategoryVM);
        Task<SubCategoryDetailsViewModel> GetByIdAsync(int subcategoryId);
        Task<SubCategoryDetailsViewModel> UpdateAsync(SubCategoryDetailsViewModel filter);
    }

    public class SubCategoryService : ISubCategoryService
    {
        private readonly IDapperRepository _dapperRepo;
        public SubCategoryService(IDapperRepository dapperRepository)
        {
            _dapperRepo = dapperRepository;
        }
        public async Task<PagedResult<SubCategoryViewListVM>> GetSubCategoriesPagedAsync(SubCatergoryFilter filter)
        {
            try
            {
                var parameters = new
                {
                    CategoryID = filter.CategoryID,
                    PageNumber = filter.PageIndex,
                    PageSize = filter.PageSize,
                    Search = filter.Search,
                    IsActive = filter.IsActive
                };
                var pagedResult = await _dapperRepo.GetPagedAsync<SubCategoryViewListVM>(
                    "SP_GetSubCategoryList",
                    parameters
                );

                return pagedResult;
            }
            catch (Exception ex)
            {

                throw;
            }
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

        public async Task<bool> CreateAsync(SubCategoryViewModel subCategory)
        {
            var parameters = new
            {
                ParentCategoryID = subCategory.CategoryID,
                Name = subCategory.Title,
                Description = subCategory.Description,
                IsActive = subCategory.IsActive
            };
            int r = await _dapperRepo.InsertAsync<int>("Sp_CreateSubCategory", parameters);
            return r > 0;
        }

        public async Task<SubCategoryDetailsViewModel> UpdateAsync(SubCategoryDetailsViewModel subCategory)
        {
            var parameters = new
            {
                CategoryID = subCategory.CategoryID,
                Name = subCategory.Title,
                Description = subCategory.Description,
                IsActive = subCategory.IsActive
            };

            var updatedCategory = await _dapperRepo.ExecuteSingleObjectStoredProcedureAsync<SubCategoryDetailsViewModel>("Sp_UpdateSubCategory", parameters);
            return updatedCategory;
        }

        public async Task<SubCategoryDetailsViewModel> GetByIdAsync(int CategoryID)
        {
            try
            {
                var parameters = new
                {
                    CategoryID = CategoryID,
                };
                var r = await _dapperRepo.ExecuteSingleObjectStoredProcedureAsync<SubCategoryDetailsViewModel>("Sp_GetCategoryById", parameters);
                return r;
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
