/*const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const {
    createClient,
    createHttpClient,
    createAuthForClientCredentialsFlow,
} = require('@commercetools/sdk-client-v2');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const projectKey = process.env.PROJECT_KEY;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const authUrl = process.env.AUTH_URL;
const apiUrl = process.env.API_URL;

const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
const tokenUrl = `${authUrl}/oauth/token?grant_type=client_credentials`;

//Create a function to get Oauth token
async function getToken() {
    const headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: headers,
    });

    if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}`);
    }

    const tokenResponseData = await tokenResponse.json();
    return tokenResponseData.access_token;
}

(async () => {
    try {
        const accessToken = await getToken();

        const client = createClient({
            middlewares: [
                createAuthForClientCredentialsFlow({
                    host: authUrl,
                    projectKey,
                    credentials: {
                        clientId,
                        clientSecret,
                    },
                    fetch,
                }),
                createHttpClient({
                    host: apiUrl,
                    fetch,
                }),
            ],
        });

        app.get('/api/products', async (req, res) => {
            try {
                const response = await client.execute({
                    uri: `/${projectKey}/products`,
                    method: 'GET',
                });
                res.json(response.body.results);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send('Error fetching products');
            }
        });

        app.get('/api/products/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const response = await client.execute({
                    uri: `/${projectKey}/products/${id}`,
                    method: 'GET',
                });
                res.json(response.body);
            } catch (error) {
                console.error('Error fetching product:', error);
                res.status(500).send('Error fetching product');
            }
        });

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
})();*/

const { createClient, createHttpClient, createAuthForClientCredentialsFlow, ClientBuilder } = require('@commercetools/sdk-client-v2');
const { createApiBuilderFromCtpClient } = require('@commercetools/platform-sdk');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const projectKey = process.env.PROJECT_KEY;
const ctpAuthUrl = process.env.AUTH_URL;
const ctpApiUrl = process.env.API_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
//console.log("CTP Project Key:", projectKey);
//console.log("CTP API URL:", ctpApiUrl);

const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
const tokenUrl = `${ctpAuthUrl}/oauth/token?grant_type=client_credentials`;

async function getToken() {
    const headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: headers,
    });

    if (!tokenResponse.ok) {
        throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}`);
    }

    const tokenResponseData = await tokenResponse.json();
    //console.log('Access Token:', tokenResponseData.access_token);
    return tokenResponseData.access_token;
}
(async () => {
    try {
        const accessToken = await getToken();

        /*const client = createClient({
            middlewares: [
                createAuthForClientCredentialsFlow({
                    host: ctpAuthUrl,
                    projectKey,
                    credentials: {
                        clientId,
                        clientSecret,
                    },
                    fetch,
                }),
                createHttpClient({
                    host: ctpApiUrl,
                    fetch,
                }),
            ],
        });*/

        const getClient = () => {
            console.log("Reached client");
            const authMiddleware = createAuthForClientCredentialsFlow({
                host: ctpAuthUrl,
                projectKey: projectKey,
                credentials: {
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                },
                fetch,
            });

            const httpMiddleware = createHttpClient({
                host: ctpApiUrl,
                fetch,
            });

            const client = createClient({
                middlewares: [authMiddleware, httpMiddleware],
            });

            return createApiBuilderFromCtpClient(client);
        };

        app.get('/api/products', async (req, res) => {
            try {
                console.log("Get Products");
                const response = await getClient()
                    .withProjectKey({ projectKey })
                    .products()
                    .get({
                        /*queryArgs: {
                            limit: perPage,
                            offset: (page - 1) * perPage
                        }*/
                    })
                    .execute();
                res.json(response.body.results);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send('Error fetching products');
            }
        });
        app.get('/api/products/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const response = await getClient()
                    .withProjectKey({ projectKey })
                    .products()
                    .withId({ ID: id })
                    .get()
                    .execute();
                res.json(response.body);
            } catch (error) {
                console.error('Error fetching product:', error);
                res.status(500).send('Error fetching product');
            }
        });

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
        //module.exports.apiRoot = getClient();
        //module.exports.projectKey = projectKey;

    } catch (error) {
        console.error('Error starting server:', error);
    }
})();
