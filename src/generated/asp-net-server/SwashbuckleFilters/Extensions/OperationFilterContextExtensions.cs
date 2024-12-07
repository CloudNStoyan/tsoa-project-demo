using System.Reflection;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AspNetServer.SwashbuckleFilters.Extensions;

public static class OperationFilterContextExtensions {
  public static IEnumerable<T> GetControllerAndActionAttributes<T>(this OperationFilterContext context) where T : Attribute
    {
      var result = new List<T>();

      if (context.MethodInfo != null)
      {
          var controllerAttributes = context.MethodInfo.ReflectedType?.GetTypeInfo().GetCustomAttributes<T>();
          if (controllerAttributes != null) {
            result.AddRange(controllerAttributes);
          }

          var actionAttributes = context.MethodInfo.GetCustomAttributes<T>();
          result.AddRange(actionAttributes);
      }

      if (context.ApiDescription.ActionDescriptor.EndpointMetadata != null)
      {
          var endpointAttributes = context.ApiDescription.ActionDescriptor.EndpointMetadata.OfType<T>();
          result.AddRange(endpointAttributes);
      }

      return result.Distinct();
    }
}
