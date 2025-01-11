namespace TaskProject.Domain.Pagging
{
    public class PagedResult<T>
    {
        public IEnumerable<T> Data { get; set; }
        public int TotalRowCount { get; set; }
        public PagedResult(IEnumerable<T> data, int totalRowCount)
        {
            Data = data;
            TotalRowCount = totalRowCount;
        }
    }
}
