const express = require('express')
const app = express()
const port = 3000

const cors = require("cors");
const helmet = require("helmet");
let supertokens = require("supertokens-node");

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) 

let { verifySession } = require("supertokens-node/recipe/session/framework/express");
let { middleware, errorHandler } = require("supertokens-node/framework/express");
let Session = require("supertokens-node/recipe/session");
let ThirdPartyEmailPassword = require("supertokens-node/recipe/thirdpartyemailpassword");

const { auth } = require('express-openid-connect');

const apiPort = process.env.REACT_APP_API_PORT || 3000;
const apiDomain = process.env.REACT_APP_API_URL || `http://localhost:${apiPort}`;

const websitePort = process.env.REACT_APP_WEBSITE_PORT || 3001;
const websiteDomain = process.env.REACT_APP_WEBSITE_URL || `http://localhost:${websitePort}`;

var neo4j = require('neo4j-driver')

var driver = neo4j.driver(
    'neo4j+s://d9478053.databases.neo4j.io',
    neo4j.auth.basic('neo4j', 'rJDuc2LXmKdObWPVMu09uUWedF0-tyDFC1RQynX8Uhc')
  );

var session = driver.session()


supertokens.init({
    framework: "express",
    supertokens: {
        // TODO: This is a core hosted for demo purposes. You can use this, but make sure to change it to your core instance URI eventually.
        connectionURI: "http://localhost:3567",
        apiKey: "",
    },
    appInfo: {
        appName: "SuperTokens Demo App", // TODO: Your app name
        apiDomain, // TODO: Change to your app's API domain
        websiteDomain, // TODO: Change to your app's website domain
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    recipeList: [
        ThirdPartyEmailPassword.init({
            providers: [
                // We have provided you with development keys which you can use for testing.
                // IMPORTANT: Please replace them with your own OAuth keys for production use.
                ThirdPartyEmailPassword.Google({
                    clientId: "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
                    clientSecret: "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",
                }),
                ThirdPartyEmailPassword.Github({
                    clientSecret: "e97051221f4b6426e8fe8d51486396703012f5bd",
                    clientId: "467101b197249757c71f",
                }),
                ThirdPartyEmailPassword.Apple({
                    clientId: "4398792-io.supertokens.example.service",
                    clientSecret: {
                        keyId: "7M48Y4RYDL",
                        privateKey:
                            "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----",
                        teamId: "YWQCXGJRJL",
                    },
                }),
            ],
        }),
        Session.init(),
    ],
  });

  app.use(
    cors({
        origin: websiteDomain, // TODO: Change to your app's website domain
        allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
        methods: ["GET", "PUT", "POST", "DELETE"],
        credentials: true,
    })
);

app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
app.use(middleware());


// const config = {
//     authRequired: false,
//     auth0Logout: true,
//     secret: 'a long, randomly-generated string stored in env',
//     baseURL: 'http://localhost:3000',
//     clientID: 'Uk5HbdyOVp5xIesTTVEsqeEpA0ftT4hR',
//     issuerBaseURL: 'https://dev-0i-3dcvz.us.auth0.com'
//   };

//   app.use(auth(config));

//   app.get('/', (req, res) => {
//     res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
//   });

app.get("/neo4j", async (req, res) => {
    session
    .run('match (n:Cliente) where n.usuario="bryrodri" return n')
    .subscribe({
        onKeys: keys => {
          console.log(keys)
        },
        onNext: record => {
          console.log(record._fields[0].properties.usuario)
        },
        onCompleted: () => {
        },
        onError: error => {
          console.log(error)
        }
      })


    res.send({
        value:true
    });
});


app.get("/createUser", async (req, res) => {
    session
    .run('create (n:Cliente{ nombre:"bryan2"})  return n')
    .subscribe({
        onKeys: keys => {
          console.log("done",keys)
        },
        onNext: record => {
          console.log("done",record._fields[0])
          console.log("hola")
        },
        onCompleted: () => {
            session.close()
        },
        onError: error => {
          console.log("error",error)
        }
      })


    res.send({
        value:true
    });
});

app.post("/getUser", async (req, res) => {
    console.log(req.body)
    var email = req.body.email
    

    const query = 'match (n:Cliente{ email:"'+email+'"})  return n';
    session
    .run(query)
    .subscribe({
        onKeys: keys => {
          console.log("done",keys)
        },
        onNext: record => {
          console.log("done",record._fields[0])
        },
        onCompleted: () => {
            session.close()
        },
        onError: error => {
          console.log("error",error)
        }
      })


    res.send({
        value:true
    });
});

app.get("/sessioninfo", verifySession(), async (req, res) => {
    let session = req.session;
    res.send({
        sessionHandle: session.getHandle(),
        userId: session.getUserId(),
        accessTokenPayload: session.getAccessTokenPayload(),
    });
});

app.use(errorHandler());

app.use((err, req, res, next) => {
    res.status(500).send("Internal error: " + err.message);
});

app.listen(apiPort, () => console.log(`API Server listening on port ${apiPort}`));