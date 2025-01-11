using Dapper;
using System.Data;
using System.Data.SqlClient;
using TaskProject.Domain.Product;

namespace TaskProject.Repositories.Dapper
{
    public interface IProductRepository
    {
        Task<ProductDetailVM> GetProductWithImagesAsync(int productId);
    }

    public class ProductRepository : IProductRepository
    {
        private readonly ConnectionFactory _connectionFactory;
        private string _connectionString;
        public ProductRepository(ConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
            _connectionString = _connectionFactory.GetConnectionString();
        }

        public async Task<ProductDetailVM> GetProductWithImagesAsync(int productId)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                var sql = "Sp_GetProductWithImages";

                var productDictionary = new Dictionary<int, ProductDetailVM>();

                var products = await connection.QueryAsync<ProductDetailVM, ProductImage, ProductDetailVM>(
                    sql,
                    (product, image) =>
                    {
                        if (!productDictionary.ContainsKey(product.ProductID))
                        {
                            productDictionary[product.ProductID] = product;
                        }

                        if (image != null)
                        {
                            productDictionary[product.ProductID].Images.Add(image);
                        }

                        return productDictionary[product.ProductID];
                    },
                    new { ProductID = productId },
                    commandType: CommandType.StoredProcedure,
                    splitOn: "ImagePath"
                );

                return products.FirstOrDefault();
            }
        }
    }
}
