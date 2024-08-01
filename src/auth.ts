import * as express from "express";

export class AuthError extends Error {}

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  scopes?: string[]
) {
  if (securityName === "api_key") {
    let token;
    if (request.query && request.query.access_token) {
      token = request.query.access_token;
    }

    console.log(scopes);

    if (token === "my-encrypted-password-fr-fr") {
      return Promise.resolve({
        id: 1,
        name: "Ironman",
      });
    } else {
      return Promise.reject(new AuthError("No token provided."));
    }
  }
}
