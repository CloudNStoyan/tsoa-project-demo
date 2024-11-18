using System.Reflection;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using AspNetServer.SchemaFilters;
using Swashbuckle.AspNetCore.Filters;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options => {
  options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddSwaggerExamplesFromAssemblies(Assembly.GetExecutingAssembly());

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => {
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

  options.SchemaFilter<PropertyExampleSchemaFilter>();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
