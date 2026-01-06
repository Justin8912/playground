export const config = {
    Auth: {
        Cognito: {
            userPoolId: "us-east-1_9Q6vhkhPW",
            userPoolClientId: "38lenicrilvq3neivbr8uu59n9",
            loginWith: {
                oauth: {
                    domain: "codenames-auth.auth.us-east-1.amazoncognito.com",
                    scopes: ["openid", "email", "profile"],
                    redirectSignIn: ["http://localhost:3000"],
                    redirectSignOut: ["http://localhost:3000"],
                    responseType: "code"
                }
            }
        }
    },
    API: {
        GraphQL: {
            endpoint: 'https://adiho2zdzjhojkodnz77k4pb6i.appsync-api.us-east-1.amazonaws.com/graphql',
            region: 'us-east-1',
            authMode: 'userPool',
        }
    }
}

export const cognitoAuthConfig = {
    authority: "https://codenames-auth.auth.us-east-1.amazoncognito.com",
    client_id: config.Auth.Cognito.userPoolClientId,
    redirect_uri: "http://localhost:3000",
    response_type: "code",
    scope: "openid email profile",
    metadata: {
        authorization_endpoint: "https://codenames-auth.auth.us-east-1.amazoncognito.com/oauth2/authorize",
        token_endpoint: "https://codenames-auth.auth.us-east-1.amazoncognito.com/oauth2/token",
        userinfo_endpoint: "https://codenames-auth.auth.us-east-1.amazoncognito.com/oauth2/userInfo",
        end_session_endpoint: "https://codenames-auth.auth.us-east-1.amazoncognito.com/logout",
        jwks_uri: `https://cognito-idp.us-east-1.amazonaws.com/${config.Auth.Cognito.userPoolId}/.well-known/jwks.json`
    }
};