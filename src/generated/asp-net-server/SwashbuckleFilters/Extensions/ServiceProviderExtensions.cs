using System.Reflection;
using Swashbuckle.AspNetCore.Filters;

namespace AspNetServer.SchemaFilters.Extensions;

public static class ServiceProviderExtensions {
  /// <summary>
  /// Gets a specific IExamplesProvider&lt;T&gt; from the ServiceProvider and calls GetExamples() on it
  /// </summary>
  /// <param name="serviceProvider"></param>
  /// <param name="examplesProviderType">Either an IExamplesProvider&lt;T&gt;, or a concrete type, e.g. PersonRequestExample</param>
  /// <returns>The result of calling GetExamples on the given examplesProviderType</returns>
  public static object? GetCustomExampleWithExamplesProviderType(this IServiceProvider serviceProvider, Type examplesProviderType)
  {
      var exampleProviderObject = serviceProvider.GetService(examplesProviderType);
      return CustomInvokeGetExamples(examplesProviderType, exampleProviderObject);
  }

  /// <summary>
  /// Searches the serviceProvider for an IExamplesProvider&lt;T&gt;, where T is the requested type
  /// </summary>
  /// <param name="serviceProvider"></param>
  /// <param name="type"></param>
  /// <returns></returns>
  public static object? GetCustomExampleForType(this IServiceProvider serviceProvider, Type type)
  {
      if (type == null || type == typeof(void) || IsPrimitiveType())
      {
          return null;
      }

      bool IsPrimitiveType()
      {
          return !type.GetTypeInfo().IsClass
              && !type.GetTypeInfo().IsGenericType
              && !type.GetTypeInfo().IsInterface;
      }

      var exampleProviderType = typeof(IExamplesProvider<>).MakeGenericType(type);
      var singleExample = GetCustomExampleWithExamplesProviderType(serviceProvider, exampleProviderType);
      if (singleExample != null)
      {
          return singleExample;
      }

      var multipleExampleProviderType = typeof(IMultipleExamplesProvider<>).MakeGenericType(type);
      return GetCustomExampleWithExamplesProviderType(serviceProvider, multipleExampleProviderType);
  }

  private static object? CustomInvokeGetExamples(Type exampleProviderType, object? exampleProviderObject)
  {
      if (exampleProviderObject == null)
      {
          return null;
      }

      var methodInfo = exampleProviderType.GetMethod("GetExamples");
      var example = methodInfo?.Invoke(exampleProviderObject, null); // yay, we've got the example! Now just need to set it.
      return example;
  }
}
