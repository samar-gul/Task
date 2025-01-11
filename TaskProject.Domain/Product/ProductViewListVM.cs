namespace TaskProject.Domain.Product
{

    public class ProductFilter
    {
        public string Search { get; set; }
        public int PageSize { get; set; }
        public int PageIndex { get; set; }
        public int? IsActive { get; set; }
    }

    public class ProductViewListVM
    {
        public int SrNo { get; set; }
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string SKU { get; set; }
        public bool IsActive { get; set; }
        public string CategoryName { get; set; }
        public int TotalRecord { get; set; }
    }




}
