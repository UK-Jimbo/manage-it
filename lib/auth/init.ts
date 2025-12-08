import SuperTokens from "supertokens-node";
import Session from "supertokens-node/recipe/session";
import EmailPassword from "supertokens-node/recipe/emailpassword";
import UserMetadata from "supertokens-node/recipe/usermetadata";

export const appInfo = {
  appName: process.env.SUPERTOKENS_APP_NAME || "ProjectManager",
  apiDomain: process.env.SUPERTOKENS_API_DOMAIN || "http://localhost:3000",
  websiteDomain:
    process.env.SUPERTOKENS_WEBSITE_DOMAIN || "http://localhost:3000",
  apiBasePath: "/api/auth",
  websiteBasePath: "/login",
};

let initialized = false;

export function ensureSuperTokensInit() {
  if (initialized) {
    return;
  }

  SuperTokens.init({
    // framework: "nextjs",
    supertokens: {
      connectionURI:
        process.env.SUPERTOKENS_CONNECTION_URI || "http://localhost:3567",
    },
    appInfo,
    recipeList: [EmailPassword.init(), Session.init(), UserMetadata.init()],
  });

  initialized = true;
}
