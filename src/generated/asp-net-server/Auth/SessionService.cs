namespace AspNetServer.Auth;

public class AuthUser
{
    public required string Name { get; set; }
    public int UserId { get; set; }
}

public class RequestSession
{
    public bool IsLoggedIn { get; set; }

    public AuthUser? User { get; set; }
}

public class SessionService
{
    private IHttpContextAccessor ContextAccessor { get; }

    public SessionService(IHttpContextAccessor contextAccessor)
    {
        this.ContextAccessor = contextAccessor;
    }

    public RequestSession Session => this.ContextAccessor.HttpContext!.GetSession();
}

public static class ExtensionSessionService
{
    private const string SessionKey = "__session__";

    public static RequestSession GetSession(this HttpContext context)
    {
      var item = context.Items[SessionKey];

      if (item == null) {
        throw new Exception("Session was not present in context object.");
      }

      return (RequestSession)item;
    }

    public static void SetSession(this HttpContext context, RequestSession session)
    {
        context.Items[SessionKey] = session;
    }
}
