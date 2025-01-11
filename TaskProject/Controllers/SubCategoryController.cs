using Microsoft.AspNetCore.Mvc;
using TaskProject.Domain.Category;
using TaskProject.Domain.SubCategory;
using TaskProject.Services.Category;

namespace TaskProject.Controllers
{
    [Route("SubCategory")]
    public class SubCategoryController : Controller
    {
        private readonly ISubCategoryService _subcategoryService;
        private readonly ICategoryService _categoryService;
        public SubCategoryController(ISubCategoryService subcategoryService, ICategoryService categoryService)
        {
            _subcategoryService = subcategoryService;
            _categoryService = categoryService;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("List")]
        public async Task<IActionResult> List()
        {
            SubCatergoryFilter catergoryFilter = new SubCatergoryFilter()
            {
                CategoryID = 1,
                PageIndex = 0,
                PageSize = 10,
            };
            return View(catergoryFilter);
        }

        [HttpPost("List")]
        public async Task<IActionResult> List(SubCatergoryFilter Filter)
        {
            try
            {
                return Json(await _subcategoryService.GetSubCategoriesPagedAsync(Filter));
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet("Add")]
        public async Task<IActionResult> Add()
        {
            CategoryViewModel model = new CategoryViewModel();
            ViewBag.CategoryDropdown = await _categoryService.GetCategoryDropdoen();
            return View();
        }

        [HttpPost("Add")]
        public async Task<IActionResult> Add(SubCategoryViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json("Validation");
                }
                if (ModelState.IsValid)
                {
                    var isSuccess = await _subcategoryService.CreateAsync(model);
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



        [HttpGet("EditSubCategory/{Id}")]
        public async Task<IActionResult> EditSubCategory(int Id)
        {
            ViewBag.CategoryDropdown = await _categoryService.GetCategoryDropdoen();

            SubCategoryDetailsViewModel model = new SubCategoryDetailsViewModel();
            model = await _subcategoryService.GetByIdAsync(Id);
            return View(model);
        }


        [HttpPost("EditSubCategory/{Id}")]
        public async Task<IActionResult> EditSubCategory(SubCategoryDetailsViewModel model, int Id)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json("Validation");
                }
                if (ModelState.IsValid)
                {
                    var result = await _subcategoryService.UpdateAsync(model);
                    if (result != null)
                    {
                        return Json(new { success = true, message = "SubCategory updated successfully!" });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Error updated SubCategory!" });
                    }
                }

                return Json(new { success = false, message = "There was an error updated the SubCategory." });
            }
            catch (Exception ex)
            {
                throw;
            }
        }



        [HttpGet(template: "GetCategoryDropdown")]
        public async Task<IActionResult> GetCategoryDropdown()
        {
            return Json(await _categoryService.GetCategoryDropdoen());
        }
    }
}
