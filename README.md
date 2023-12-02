# KindeStrategy

The Kinde strategy is used to authenticate users against a [Kinde](https://kinde.com/) account. It extends the [OAuth2Strategy](https://github.com/sergiodxa/remix-auth-oauth2).

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | Untested    |

## Usage

### Installation

```bash
npm i remix-auth-kinde
```

### Create a Kinde account

These instructions assume you already have a Kinde account. You can [register for free here](https://app.kinde.com/register) (no credit card required).

You also need a Kinde domain to get started, e.g. <your_subdomain>.kinde.com.

### Set callback URLs

1. In Kinde, go to **Settings > Applications > [Your app] > View details**.
2. Add your callback URLs in the relevant fields. For example:
   - Allowed callback URLs (also known as redirect URIs) - for example http://localhost:3000/auth/kinde_callback
   - Allowed logout redirect URLs - for example http://localhost:3000
3. Select **Save**.

### Create the strategy instance

```TS
import { KindeStrategy } from "remix-auth-kinde";

let kindeStrategy = new KindeStrategy(
  {
    domain: "YOUR_KINDE_DOMAIN",
    clientID: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    callbackURL: "https://example.com/auth/kinde/callback",
    scope: ["email", "offline", "openid", "profile"],
    audience: ["https://api.example.com"],
  },
  async ({ accessToken, refreshToken, extraParams, profile, context, request }) => {
    // Get the user data from your DB or API using the tokens and profile
    return User.findOrCreate({ email: profile.emails[0].value });
  }
);

authenticator.use(kindeStrategy);
```

### Setup your routes

```TS
// app/routes/login.tsx
export default function Login() {
  return (
    <Form action="/auth/kinde" method="post">
      <button>Login with Kinde</button>
    </Form>
  );
}
```

```TS
// app/routes/auth/kinde.tsx
import { ActionFunction, LoaderFunction, redirect } from "remix";
import { authenticator } from "~/auth.server";

export let loader: LoaderFunction = () => redirect("/login");

export let action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("kinde", request);
};
```

```TS
// app/routes/auth/kinde/callback.tsx
import { LoaderFunction } from "remix";
import { authenticator } from "~/auth.server";

export let loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("kinde", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
```

### Aknowledgements
Thanks to [@sergiodxa](https://github.com/sergiodxa) for [remix-auth](https://github.com/sergiodxa/remix-auth) and the [remix-auth-strategy-template](https://github.com/sergiodxa/remix-auth-strategy-template).