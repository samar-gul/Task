using TaskProject.Repositories.Dapper;
using TaskProject.Services.Category;
using TaskProject.Services.Products;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddSingleton<ConnectionStringProvider>();
builder.Services.AddSingleton<ConnectionFactory>();
builder.Services.AddScoped<IDapperRepository, DapperRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();

#region Category Services

builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ISubCategoryService, SubCategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();



#endregion

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
