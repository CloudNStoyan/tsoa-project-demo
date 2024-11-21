using System.Reflection;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using AspNetServer.SwashbuckleFilters;
using Swashbuckle.AspNetCore.Filters;
using Microsoft.AspNetCore.Mvc.Formatters;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

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

  options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "1.0.0",
        Title = "TSOA Demo Pet Store - OpenAPI 3.0",
        Description = "Pet Store Server OpenAPI 3.0 specification.\n\nSome useful links:\n- [The TSOA Demo Pet Store repository](https://github.com/CloudNStoyan/tsoa-project-demo)\n- [The source API definition for the Pet Store](https://github.com/CloudNStoyan/tsoa-project-demo/blob/main/src/generated/swagger.yaml)",
    });

  options.ExampleFilters();

  string xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
  options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
  options.UseAllOfToExtendReferenceSchemas();

  options.SchemaFilter<PropertyExampleFilter>();
  options.OperationFilter<RemoveTextJsonResponseFilter>();
  options.OperationFilter<ErrorExampleFilter>();
  options.OperationFilter<NoInlineSchemaFilter>();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
