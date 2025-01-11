using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace TaskProject.Domain.Category
{
    public class CategoryViewModel
    {
        public int CategoryID { get; set; }

        [Required(ErrorMessage = "Category Title is required.")]
        [StringLength(100, ErrorMessage = "Category Title cannot be longer than 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Category Icon is required.")]
        public IFormFile Icon { get; set; }

        [Required(ErrorMessage = "Category Description is required.")]
        [StringLength(500, ErrorMessage = "Category Description cannot be longer than 500 characters.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Status (IsActive) is required.")]
        public bool IsActive { get; set; }

        public string? IConImage { get; set; }
    }

    public class CategoryDetailViewModel
    {
        public int CategoryID { get; set; }
        [Required(ErrorMessage = "Category Title is required.")]
        [StringLength(100, ErrorMessage = "Category Title cannot be longer than 100 characters.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Category Description is required.")]
        [StringLength(500, ErrorMessage = "Category Description cannot be longer than 500 characters.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Status (IsActive) is required.")]
        public bool IsActive { get; set; }

        public string? Icon { get; set; }
        public IFormFile? IconFile { get; set; }

    }
}


