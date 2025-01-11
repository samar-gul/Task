using Microsoft.AspNetCore.Mvc;
using TaskProject.Domain.Category;
using TaskProject.Services.Category;

namespace TaskProject.Controllers
{
    [Route("Category")]
    public class CategoryController : Controller
    {
        private readonly ICategoryService _categoryService;
        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("List")]
        public async Task<IActionResult> List()
        {
            CatergoryFilter catergoryFilter = new CatergoryFilter()
            {
                PageIndex = 0,
                PageSize = 10,
            };
            return View(catergoryFilter);
        }

        [HttpPost("List")]
        public async Task<IActionResult> List(CatergoryFilter Filter)
        {
            try
            {
                return Json(await _categoryService.GetCategoriesPagedAsync(Filter));
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet("NewCategory")]
        public async Task<IActionResult> NewCategory()
        {
            CategoryViewModel model = new CategoryViewModel();
            return View();
        }

        [HttpPost("NewCategory")]
        public async Task<IActionResult> CreateCategory(CategoryViewModel model, IFormFile Icon)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json("Validation");
                }
                if (ModelState.IsValid)
                {
                    var isSuccess = await _categoryService.CreateAsync(model);
                    if (isSuccess)
                    {
                        return Json(new { success = true, message = "Category created successfully!" });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Error creating category!" });
                    }
                }

                return Json(new { success = false, message = "There was an error creating the category." });
            }
            catch (Exception ex)
            {

                throw;
            }

        }

        [HttpGet("EditCategory/{Id}")]
        public async Task<IActionResult> EditCategory(int Id)
        {
            CategoryDetailViewModel model = new CategoryDetailViewModel();
            model = await _categoryService.GetByIdAsync(Id);
            return View(model);
        }

        [HttpPost("EditCategory/{Id}")]
        public async Task<IActionResult> EditCategory(CategoryDetailViewModel model, int Id)
        {
            if (!ModelState.IsValid)
            {
                return Json("Validation");
            }
            if (ModelState.IsValid)
            {
                var result = await _categoryService.UpdateAsync(model);
                if (result != null)
                {
                    return Json(new { success = true, message = "Category created successfully!" });
                }
                else
                {
                    return Json(new { success = false, message = "Error creating category!" });
                }
            }
            return Json(new { success = false, message = "There was an error updated the category." });
        }


        [HttpPost]
        public async Task<JsonResult> CreateCategory(CategoryViewModel category)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json("validation");
                }
                var isSuccess = await _categoryService.CreateAsync(category);
                if (isSuccess)
                {
                    return Json(new { success = true, message = "Category created successfully!" });
                }
                else
                {
                    return Json(new { success = false, message = "Error creating category!" });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error creating category!" });
            }
        }


        [HttpPost("Delete")]
        public async Task<JsonResult> Delete(int CategoryID)
        {
            try
            {
                if (await _categoryService.Delete(CategoryID))
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
