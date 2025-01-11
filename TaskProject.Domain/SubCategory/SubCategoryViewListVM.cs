namespace TaskProject.Domain.SubCategory
{
    public class SubCatergoryFilter
    {
        public string Search { get; set; }
        public int PageSize { get; set; }
        public int PageIndex { get; set; }
        public int CategoryID { get; set; }
        public int? IsActive { get; set; }
    }

    public class SubCategoryViewListVM
    {
        public int ParentCategoryID { get; set; }
        public int CategoryID { get; set; }
        public int SrNo { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public string CreatedDate { get; set; }
        public string Path { get; set; }
        public int CategoryLevel { get; set; }
        public string Icon { get; set; }
        public int TotalRecord { get; set; }
    }


    public class SubCategoryViewListVMCombine
    {
        public int ParentCategoryID { get; set; }
        public int CategoryID { get; set; }
        public int SrNo { get; set; }
        public string CategoryName { get; set; }
        public string SubCategoryName { get; set; }
        public string Path { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public string CreatedDate { get; set; }
        public int CategoryLevel { get; set; }
        public string Icon { get; set; }
        public int TotalRecord { get; set; }
    }
}
