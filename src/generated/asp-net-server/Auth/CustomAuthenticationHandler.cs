using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AspNetServer.Auth;

public class CustomAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private SessionService SessionService { get; }

    public CustomAuthenticationHandler(
      IOptionsMonitor<AuthenticationSchemeOptions> options,
      ILoggerFactory logger,
      UrlEncoder encoder,
      SessionService sessionService) : base(options, logger, encoder)
    {
      this.SessionService = sessionService;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
      var session = this.SessionService.Session;

      if (!session.IsLoggedIn)
      {
          return Task.FromResult(AuthenticateResult.Fail("Session was not logged in!"));
      }

      var principal = new ClaimsPrincipal(this.Context.User.Identity!);
      var ticket = new AuthenticationTicket(principal, this.Scheme.Name);
      return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
      this.Context.Response.StatusCode = StatusCodes.Status401Unauthorized;
      this.Context.Response.WriteAsJsonAsync(new ProblemDetails() {
        Status = StatusCodes.Status401Unauthorized,
        Title = "Unauthorized",
        Detail = "Access Denied!"
      });

      return Task.CompletedTask;
    }
}

public static class CustomAuthenticationExtension
{
    public static AuthenticationBuilder AddCustomAuthentication(this AuthenticationBuilder builder, string authenticationScheme)
    {
      return builder.AddScheme<AuthenticationSchemeOptions, CustomAuthenticationHandler>(authenticationScheme, null);
    }
}
