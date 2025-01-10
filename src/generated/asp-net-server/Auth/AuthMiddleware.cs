using System.Security.Claims;

namespace AspNetServer.Auth;

public class AuthMiddleware {
  private readonly RequestDelegate next;

  public AuthMiddleware(RequestDelegate next)
  {
    this.next = next;
  }

  public async Task Invoke(HttpContext context) {
    context.SetSession(new RequestSession());

    if (!context.Request.Headers.TryGetValue("Authorization", out var authorizationHeaders)) {
      await this.next.Invoke(context);
      return;
    }

    if (authorizationHeaders.Count == 0 || authorizationHeaders[0] == null) {
      await this.next.Invoke(context);
      return;
    }

    string authorizationHeader = authorizationHeaders[0]!;


    string[] parts = authorizationHeader.Split(" ");

    string tokenType = parts[0];
    string tokenValue = parts[1];

    if (tokenType.ToLowerInvariant() == "bearer" && tokenValue == "simple-pet-token") {
      var authUser = new AuthUser()
      {
        Name = "Stoyan",
        UserId = 1
      };

      context.SetSession(new () {
        IsLoggedIn = true,
        User = authUser
      });

      var identity = new ClaimsIdentity("Custom");
      identity.AddClaim(new Claim(ClaimTypes.Name, authUser.Name));
      context.User = new ClaimsPrincipal(identity);
    }

    await this.next.Invoke(context);
  }
}

public static class AuthMiddlewareExtension {
  public static IApplicationBuilder UseAuthMiddleware(this IApplicationBuilder builder)
  {
      return builder.UseMiddleware<AuthMiddleware>();
  }
}
