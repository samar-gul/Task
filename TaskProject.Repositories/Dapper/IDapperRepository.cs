using Dapper;
using System.Data;
using System.Data.SqlClient;
using TaskProject.Domain.Pagging;

namespace TaskProject.Repositories.Dapper
{
    public interface IDapperRepository
    {
        Task<IEnumerable<T>> ExecuteStoredProcedureAsync<T>(string storedProcedureName, object parameters = null);
        Task<T> ExecuteScalarStoredProcedureAsync<T>(string storedProcedureName, object parameters = null);
        Task<T> InsertAsync<T>(string storedProcedure, object parameters);
        Task<PagedResult<T>> GetPagedAsync<T>(string storedProcedure, object parameters);

        Task<T> ExecuteSingleObjectStoredProcedureAsync<T>(string storedProcedureName, object parameters = null);
    }

    public class DapperRepository : IDapperRepository
    {
        private readonly ConnectionFactory _connectionFactory;
        private string _connectionString;
        public DapperRepository(ConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory ?? throw new ArgumentNullException(nameof(connectionFactory));
            _connectionString = _connectionFactory.GetConnectionString();
        }
        public async Task<IEnumerable<T>> ExecuteStoredProcedureAsync<T>(string storedProcedureName, object parameters = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                return await connection.QueryAsync<T>(
                    storedProcedureName,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );
            }
        }

        public async Task<T> ExecuteScalarStoredProcedureAsync<T>(string storedProcedureName, object parameters = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                return await connection.ExecuteScalarAsync<T>(
                    storedProcedureName,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );
            }
        }




        public async Task<T> ExecuteSingleObjectStoredProcedureAsync<T>(string storedProcedureName, object parameters = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                return await connection.QuerySingleOrDefaultAsync<T>(
                    storedProcedureName,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );
            }
        }


        public async Task ExecuteStoredProcedureNonQueryAsync(string storedProcedureName, object parameters = null)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                await connection.ExecuteAsync(
                    storedProcedureName,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );
            }
        }

        public async Task<T> InsertAsync<T>(string storedProcedure, object parameters)
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var result = await connection.ExecuteScalarAsync<T>(
                        storedProcedure,
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );

                    return result;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error while executing insert stored procedure", ex);
            }
        }

        public async Task<PagedResult<T>> GetPagedAsync<T>(string storedProcedure, object parameters)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                var result = await connection.QueryAsync<T>(
                    storedProcedure,
                    parameters,
                    commandType: CommandType.StoredProcedure
                );
                var totalRowCount = 0;

                return new PagedResult<T>(result, totalRowCount);
            }
        }



    }
}
