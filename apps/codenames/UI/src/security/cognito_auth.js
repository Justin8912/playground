export const config = {
    Auth: {
        Cognito: {
            userPoolId: "us-east-1_rkuxuBdjc",
            userPoolClientId: "1gijvahjluagfd6lmojv0riiud",
            loginWith: {
                oauth: {
                    domain: "codenames-auth.auth.us-east-1.amazoncognito.com",
                    scopes: ["openid", "email", "profile"],
                    redirectSignIn: ["http://localhost:3000", "https://mainframe.iguanodon-matrix.ts.net:3000"],
                    redirectSignOut: ["http://localhost:3000", "https://mainframe.iguanodon-matrix.ts.net:3000"],
                    responseType: "code"
                }
            }
        }
    },
    API: {
        GraphQL: {
            endpoint: 'https://5na2ci7xxzbhfhvbgqdwx2ifba.appsync-api.us-east-1.amazonaws.com/graphql',
            region: 'us-east-1',
            authMode: 'userPool',
        }
    }
}
