using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

public class RemoveUndesiredMinLengthFilter : ISchemaFilter
{
  public void Apply(OpenApiSchema schema, SchemaFilterContext context)
  {
    if (schema.Type != "string" || schema.MinLength == null) {
      return;
    }

    var minLengthAttr = context.MemberInfo.GetCustomAttribute<MinLengthAttribute>();

    if (minLengthAttr != null) {
      return;
    }

    schema.MinLength = null;
  }
}
