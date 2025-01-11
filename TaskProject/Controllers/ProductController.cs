using Microsoft.AspNetCore.Mvc;
using TaskProject.Domain.Product;
using TaskProject.Services.Category;
using TaskProject.Services.Products;

namespace TaskProject.Controllers
{
    [Route("Product")]
    public class ProductController : Controller
    {
        private readonly IProductService _productService;
        private readonly ICategoryService _categoryService;
        public ProductController(IProductService productService, ICategoryService categoryService)
        {
            _productService = productService;
            _categoryService = categoryService;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("List")]
        public async Task<IActionResult> List()
        {
            ProductFilter catergoryFilter = new ProductFilter()
            {
                PageIndex = 0,
                PageSize = 10,
            };
            return View(catergoryFilter);
        }

        [HttpPost("List")]
        public async Task<IActionResult> List(ProductFilter Filter)
        {
            try
            {
                return Json(await _productService.GetPagedResult(Filter));
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet("Add")]
        public async Task<IActionResult> Add()
        {
            ProductViewModel model = new ProductViewModel();
            ViewBag.CategoryDropdown = await _categoryService.GetCategoryDropdoen();

            return View();
        }

        [HttpPost("Add")]
        public async Task<IActionResult> Add(ProductViewModel model, List<IFormFile> ImageFiles)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json("Validation");
                }
                if (ModelState.IsValid)
                {
                    var isSuccess = await _productService.CreateAsync(model);
                    if (isSuccess)
                    {
                        return Json(new { success = true, message = "Product created successfully!" });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Error creating product!" });
                    }
                }
                return Json(new { success = false, message = "There was an error creating the product." });
            }
            catch (Exception ex)
            {
                throw;
            }
        }



        [HttpGet("Edit/{Id}")]
        public async Task<IActionResult> Edit(int Id)
        {
            ProductDetailVM model = new ProductDetailVM();
            ViewBag.CategoryDropdown = await _categoryService.GetCategoryDropdoen();
            model = await _productService.GetProductWithImagesAsync(Id);
            return View(model);
        }

        [HttpPost("Edit/{Id}")]
        public async Task<IActionResult> Edit(ProductDetailVM model, List<IFormFile> fromFiles)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json("Validation");
                }
                if (ModelState.IsValid)
                {
                    var isSuccess = await _productService.Update(model);
                    if (isSuccess)
                    {
                        return Json(new { success = true, message = "Product updated successfully!" });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Error updating product!" });
                    }
                }
                return Json(new { success = false, message = "There was an error creating the updating." });
            }
            catch (Exception ex)
            {
                throw;
            }
        }


        [HttpGet("ViewDetails/{Id}")]
        public async Task<IActionResult> ViewDetails(int Id)
        {
            ProductDetailVM model = new ProductDetailVM();
            ViewBag.CategoryDropdown = await _categoryService.GetCategoryDropdoen();
            model = await _productService.GetProductWithImagesAsync(Id);
            return View(model);
        }



        [HttpPost("DeleteImage")]
        public async Task<JsonResult> DeleteImage(int ImageId)
        {
            try
            {
                if (await _productService.DeleteProductImage(ImageId))
                    return Json("Success");
                else
                    return Json("Failed");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost("Delete")]
        public async Task<JsonResult> Delete(int productId)
        {
            try
            {
                if (await _productService.Delete(productId))
                    return Json("Success");
                else
                    return Json("Failed");
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}