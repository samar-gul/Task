using Microsoft.AspNetCore.Http;

namespace TaskProject.Domain.Product
{
    public class ProductViewModel
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string SKU { get; set; }
        public bool IsActive { get; set; }
        public int CategoryID { get; set; }
        public List<IFormFile> ImageFiles { get; set; }
    }
}
