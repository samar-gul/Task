using System.ComponentModel.DataAnnotations;

namespace TaskProject.Domain.SubCategory
{
    public class SubCategoryViewModel
    {
        [Required(ErrorMessage = "Category ID is required.")]
        public int CategoryID { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "IsActive field is required.")]
        public bool IsActive { get; set; }
    }

    public class SubCategoryDetailsViewModel
    {
        [Required(ErrorMessage = "Category ID is required.")]
        public int CategoryID { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Description is required.")]
        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "IsActive field is required.")]
        public bool IsActive { get; set; }
    }
}
