import type {
  OAuth2Profile,
  OAuth2StrategyVerifyParams,
} from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";
import type { StrategyVerifyCallback } from "remix-auth";

type KindeStartPage = "login" | "registration";
type KindeScope = "email" | "offline" | "openid" | "profile";

// See: https://kinde.com/docs/developer-tools/using-kinde-without-an-sdk/#request-parameters
export interface KindeStrategyOptions {
  domain: string;
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: KindeScope[] | KindeScope;
  audience?: string[];
  startPage?: KindeStartPage;
  orgCode?: string;
  isCreateOrg?: boolean;
  orgName?: string;
}

export interface KindeExtraParams extends Record<string, string | number> {
  expires_in: 86_400;
  id_token: string;
  scope: string;
  token_type: "Bearer";
}

export interface KindeProfile extends OAuth2Profile {
  id: string;
  sub: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
  updated_at: Date;
  _json: {
    id: string;
    sub: string;
    name: string;
    email: string;
    picture?: string;
    given_name: string;
    family_name: string;
    updated_at: number;
  };
}

export class KindeStrategy<User> extends OAuth2Strategy<
  User,
  KindeProfile,
  KindeExtraParams
> {
  name = "kinde";

  private userInfoURL: string;
  private scope: KindeScope[] | KindeScope;
  private audience?: string[];
  private startPage?: KindeStartPage;
  private orgCode?: string;
  private isCreateOrg?: boolean;
  private orgName?: string;

  constructor(
    options: KindeStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<KindeProfile, KindeExtraParams>
    >
  ) {
    super(
      {
        authorizationURL: `https://${options.domain}/oauth2/auth`,
        tokenURL: `https://${options.domain}/oauth2/token`,
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        callbackURL: options.callbackURL,
      },
      verify
    );

    this.userInfoURL = `https://${options.domain}/oauth2/v2/user_profile`;
    this.scope = options.scope || ["email", "offline", "openid", "profile"];
    this.audience = options.audience || [];
    this.startPage = options.startPage || "login";
    this.orgCode = options.orgCode;
    this.isCreateOrg = options.isCreateOrg;
    this.orgName = options.orgName;
  }

  protected authorizationParams(): URLSearchParams {
    const params = new URLSearchParams({
      scope: Array.isArray(this.scope) ? this.scope.join(" ") : this.scope,
    });

    if (this.audience) {
      for (const aud of this.audience) {
        params.append("audience", aud);
      }
    }

    if (this.startPage) {
      params.append("start_page", this.startPage);
    }

    if (this.orgCode) {
      params.append("org_code", this.orgCode);
    }

    if (this.isCreateOrg) {
      params.append("is_create_org", "true");
    }

    if (this.orgName) {
      params.append("org_name", this.orgName);
    }

    return params;
  }

  protected async userProfile(accessToken: string): Promise<KindeProfile> {
    const response = await fetch(this.userInfoURL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data: KindeProfile["_json"] = await response.json();

    const profile: KindeProfile = {
      provider: "kinde",
      id: data.id,
      sub: data.sub,
      displayName: data.name,
      name: {
        givenName: data.given_name,
        familyName: data.family_name,
      },
      emails: [{ value: data.email }],
      photos: data.picture ? [{ value: data.picture }] : [],
      updated_at: new Date(data.updated_at * 1000),
      _json: data,
    };

    return profile;
  }
}
