using Microsoft.AspNetCore.Http;

namespace TaskProject.Domain.Product
{
    public class ProductDetailVM
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int? StockQuantity { get; set; }
        public string? SKU { get; set; }
        public bool IsActive { get; set; }
        public int Category_ID { get; set; }
        public string? CategoryName { get; set; }
        public List<IFormFile>? fromFiles { get; set; }
        public List<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
    public class ProductImage
    {
        public int ImageId { get; set; }
        public string ImagePath { get; set; }
        public string FileName { get; set; }
        public int ImageStatus { get; set; }
    }
}
