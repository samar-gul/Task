using Microsoft.Extensions.Hosting;

namespace TaskProject.Repositories.Dapper
{
    public class ConnectionFactory
    {
        private readonly ConnectionStringProvider _connectionStringProvider;
        private readonly IHostEnvironment _hostEnvironment;
        public ConnectionFactory(ConnectionStringProvider connectionStringProvider, IHostEnvironment hostEnvironment)
        {
            _connectionStringProvider = connectionStringProvider ?? throw new ArgumentNullException(nameof(connectionStringProvider));
            _hostEnvironment = hostEnvironment ?? throw new ArgumentNullException(nameof(hostEnvironment));
        }

        public string GetConnectionString(string connectionName = "DefaultConnection")
        {
            if (_hostEnvironment.IsDevelopment())
            {
                return _connectionStringProvider.GetConnectionString("DevConnection");
            }
            else if (_hostEnvironment.IsProduction())
            {
                return _connectionStringProvider.GetConnectionString("ProdConnection");
            }
            else if (_hostEnvironment.IsStaging())
            {
                return _connectionStringProvider.GetConnectionString("StagingConnection");
            }

            return _connectionStringProvider.GetConnectionString(connectionName);
        }
    }
}
