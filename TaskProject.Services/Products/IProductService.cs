using Dapper;
using System.Data;
using TaskProject.Domain.Pagging;
using TaskProject.Domain.Product;
using TaskProject.Repositories.Dapper;

namespace TaskProject.Services.Products
{
    public interface IProductService
    {
        Task<PagedResult<ProductViewListVM>> GetPagedResult(ProductFilter filter);
        Task<bool> CreateAsync(ProductViewModel product);
        Task<bool> Update(ProductDetailVM model);
        Task<ProductDetailVM> GetProductWithImagesAsync(int productId);
        Task<bool> Delete(int ProductId);
        Task<bool> DeleteProductImage(int ImageId);
    }
    public class ProductService : IProductService
    {
        private readonly IDapperRepository _dapperRepo;
        private readonly IProductRepository _productRepository;
        public ProductService(IDapperRepository dapperRepository, IProductRepository productRepository)
        {
            _dapperRepo = dapperRepository;
            _productRepository = productRepository;
        }
        public async Task<PagedResult<ProductViewListVM>> GetPagedResult(ProductFilter filter)
        {
            var parameters = new
            {
                PageNumber = filter.PageIndex,
                PageSize = filter.PageSize,
                Search = filter.Search,
                IsActive = filter.IsActive,
            };
            var pagedResult = await _dapperRepo.GetPagedAsync<ProductViewListVM>(
                "Sp_GetProductsWithPagination",
                parameters
            );
            return pagedResult;
        }

        public async Task<bool> Delete(int ProductId)
        {
            var parameters = new
            {
                ProductID = ProductId,
            };
            var deleteCategory = await _dapperRepo.ExecuteScalarStoredProcedureAsync<int>("[Sp_DeleteProduct]", parameters);

            return deleteCategory > 0;
        }


        public async Task<bool> DeleteProductImage(int ImageId)
        {
            try
            {
                var parameters = new
                {
                    ImageId = ImageId,
                };
                var imagePath = await _dapperRepo.ExecuteSingleObjectStoredProcedureAsync<string>("[Sp_DeleteProductImage]", parameters);
                //DeleteImage(imagePath);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public void DeleteImage(string imagePath)
        {
            if (File.Exists(imagePath))
            {
                File.Delete(imagePath);
            }
        }

        public async Task<bool> CreateAsync(ProductViewModel model)
        {
            var imagesFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");

            if (!Directory.Exists(imagesFolderPath))
            {
                Directory.CreateDirectory(imagesFolderPath);
            }

            DataTable imageTable = new DataTable();
            imageTable.Columns.Add("ImageFilePath", typeof(string));
            imageTable.Columns.Add("FileName", typeof(string));

            foreach (var file in model.ImageFiles)
            {
                if (file.Length > 0)
                {
                    var fileName = file.FileName;
                    var filePath = Path.Combine(imagesFolderPath, fileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(fileStream);
                    }
                    imageTable.Rows.Add("/images/products/" + fileName, fileName);
                }
            }
            var parameters = new
            {
                ProductName = model.ProductName,
                Price = model.Price,
                StockQuantity = model.StockQuantity,
                SKU = model.SKU,
                IsActive = model.IsActive,
                CategoryID = model.CategoryID,
                Images = imageTable.AsTableValuedParameter("dbo.tblProductImages")
            };
            var result = await _dapperRepo.ExecuteScalarStoredProcedureAsync<int>("Sp_CreateProduct", parameters);

            return result > 0;
        }

        public async Task<bool> Update(ProductDetailVM model)
        {
            var imagesFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");

            if (!Directory.Exists(imagesFolderPath))
            {
                Directory.CreateDirectory(imagesFolderPath);
            }
            DataTable imageTable = new DataTable();
            imageTable.Columns.Add("ImageFilePath", typeof(string));
            imageTable.Columns.Add("FileName", typeof(string));
            if (model.fromFiles != null)
            {
                foreach (var file in model.fromFiles)
                {
                    if (file.Length > 0)
                    {
                        var fileName = file.FileName;
                        var filePath = Path.Combine(imagesFolderPath, fileName);

                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }
                        imageTable.Rows.Add("/images/products/" + fileName, fileName);
                    }
                }
            }
            var parameters = new
            {
                ProductID = model.ProductID,
                ProductName = model.ProductName,
                Price = model.Price,
                StockQuantity = model.StockQuantity,
                SKU = model.SKU,
                IsActive = model.IsActive,
                CategoryID = model.Category_ID,
                Images = imageTable.AsTableValuedParameter("dbo.tblProductImages")
            };
            var result = await _dapperRepo.ExecuteScalarStoredProcedureAsync<int>("Sp_EditProduct", parameters);

            return result > 0;
        }

        public async Task<ProductDetailVM> GetProductWithImagesAsync(int productId)
        {
            ProductDetailVM productDetailVM = new ProductDetailVM();
            productDetailVM = await _productRepository.GetProductWithImagesAsync(productId);
            return productDetailVM;
        }
    }
}
