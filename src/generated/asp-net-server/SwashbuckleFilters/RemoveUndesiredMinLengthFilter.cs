using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters;

/// <summary>
/// Removes 'minLength: 1' strings that do not have an explicit MinLength attribute.
/// </summary>
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
