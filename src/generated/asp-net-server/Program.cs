using System.Reflection;
using System.Text.Json.Serialization;
using Swashbuckle.AspNetCore.Filters;
using Microsoft.AspNetCore.Mvc.Formatters;
using System.Text.Json;
using AspNetServer.SwashbuckleFilters.Extensions;
using AspNetServer.Auth;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication("CustomAuth").AddCustomAuthentication("CustomAuth");
builder.Services.AddAuthorization();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<SessionService>();

builder.Services
  .AddControllers(options => {
    options.OutputFormatters.RemoveType<StringOutputFormatter>();
  })
  .AddJsonOptions(options => {
    // These are the JsonSerializerDefaults.Web settings
    // https://learn.microsoft.com/en-us/dotnet/api/system.text.json.jsonserializerdefaults?view=net-9.0
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;

    // This makes our enums string literal instead of numbers
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
  });

builder.Services.AddSwaggerExamplesFromAssemblies(Assembly.GetExecutingAssembly());

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
  options.CustomOperationIds(x => x.ActionDescriptor.RouteValues["action"]);

  options.SwaggerDocUsingGeneratedDefinitions();

  options.ExampleFilters();

  string xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
  options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
  options.UseAllOfToExtendReferenceSchemas();

  options.AddCustomFilters();
});

var app = builder.Build();


app.UseAuthMiddleware();

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
