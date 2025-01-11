namespace TaskProject.Domain.Category
{

    public class CatergoryFilter
    {
        public string Search { get; set; }
        public int PageSize { get; set; }
        public int PageIndex { get; set; }
        public string SortColumn { get; set; }
        public string SortOrder { get; set; }
        public int? IsActive { get; set; }

    }

    public class CategoryViewListVM
    {
        public int CategoryId { get; set; }
        public int SrNo { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public string CreatedDate { get; set; }
        public int TotalRecord { get; set; }
    }
}
