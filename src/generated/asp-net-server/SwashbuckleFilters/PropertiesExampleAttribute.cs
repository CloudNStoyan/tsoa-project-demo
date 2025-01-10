namespace AspNetServer.SwashbuckleFilters;

[AttributeUsage(AttributeTargets.Class)]
public class PropertiesExampleAttribute : Attribute {
  public Type ExamplesProviderType { get; }

  public PropertiesExampleAttribute(Type examplesProviderType)
  {
    ExamplesProviderType = examplesProviderType;
  }
}
