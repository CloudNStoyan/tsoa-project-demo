namespace AspNetServer.SchemaFilters;

[AttributeUsage(AttributeTargets.Class)]
public class PropertiesExampleAttribute : Attribute {
  public Type ExamplesProviderType { get; }

  public PropertiesExampleAttribute(Type examplesProviderType)
  {
    ExamplesProviderType = examplesProviderType;
  }
}
