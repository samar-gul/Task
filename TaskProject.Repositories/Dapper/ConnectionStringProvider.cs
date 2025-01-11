using Microsoft.Extensions.Configuration;

namespace TaskProject.Repositories.Dapper
{
    public class ConnectionStringProvider
    {
        private readonly IConfiguration _configuration;

        public ConnectionStringProvider(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }

        public string GetConnectionString(string name = "DefaultConnection")
        {
            var connectionString = _configuration.GetConnectionString(name);

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException($"Connection string '{name}' is not defined in the configuration.");
            }
            return connectionString;
        }
    }
}
