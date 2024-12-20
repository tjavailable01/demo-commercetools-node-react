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
                const { page = 1, limit = 10, category = '' } = req.query;
                const offset = (page - 1) * limit;
                const where = category ? `masterData(current(categories(id="${category}")))` : undefined;
                const queryArgs = {
                    limit,
                    offset,
                    ...(where && { where }),
                };
                const response = await client.execute({
                    uri: `/${projectKey}/products?${new URLSearchParams(queryArgs).toString()}`,
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

        app.get('/api/categories', async (req, res) => {
            const limit = 200;
            try {
                const response = await client.execute({
                    uri: `/${projectKey}/categories?limit=${limit}`,
                    method: 'GET',
                });
                res.json(response.body.results);
            } catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).send('Error fetching categories');
            }
        });

        app.get('/api/categories/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const response = await client.execute({
                    uri: `/${projectKey}/categories/${id}`,
                    method: 'GET',
                });
                res.json(response.body);
            } catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).send('Error fetching categories');
            }
        });

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
})();*/

const { createClient, createHttpClient, createAuthForClientCredentialsFlow } = require('@commercetools/sdk-client-v2');
const { createApiBuilderFromCtpClient } = require('@commercetools/platform-sdk');
const fetch = require('node-fetch');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

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

        // Create the Client Api Builder
        const getClient = () => {
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

        // Api Endpoint to fetch all products  with filters
        app.get('/api/products', async (req, res) => {
            const { page = 1, limit = 10, category = '' } = req.query;
            const offset = (page - 1) * limit;
            const where = category ? `masterData(current(categories(id="${category}")))` : undefined;
            try {
                let queryArgs = {
                    limit,
                    offset,
                    ...(where && { where }),
                };
                const response = await getClient()
                    .withProjectKey({ projectKey })
                    .products()
                    .get({ queryArgs })
                    .execute();
                res.json(response.body.results);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send('Error fetching products');
            }
        });

        // Api Endpoint to fetch product details
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

        // Api Endpoint to fetch all categories
        app.get('/api/categories', async (req, res) => {
            const limit = 200;
            try {
                let queryArgs = {
                    limit
                };
                const response = await getClient()
                    .withProjectKey({ projectKey })
                    .categories()
                    .get({ queryArgs })
                    .execute();
                res.json(response.body.results);
            } catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).send('Error fetching categories');
            }
        });

        // Api Endpoint to fetch categories by id
        app.get('/api/categories/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const response = await getClient()
                    .withProjectKey({ projectKey })
                    .categories()
                    .withId({ ID: id })
                    .get()
                    .execute();
                res.json(response.body);
            } catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).send('Error fetching categories');
            }
        });

        // Api Endpoint for Customer Registration
        app.post('/api/register', [
            check('email', 'Email is required').isEmail(),
            check('password', 'Password is required').isLength({ min: 6 })
        ], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);

            try {
                const client = getClient();
                const customerDraft = {
                    email,
                    password: hashedPassword,
                };

                const response = await client.withProjectKey({ projectKey })
                    .customers()
                    .post({ body: customerDraft })
                    .execute();

                res.status(201).json({ message: 'Customer registered successfully', customer: response.body });
            } catch (error) {
                res.status(500).json({ message: 'Error registering customer', error });
            }
        });

        // Api Endpoint for Customer login
        app.post('/api/login', [
            check('email', 'Email is required').isEmail(),
            check('password', 'Password is required').not().isEmpty()
        ], async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;
            const scope = `manage_project:${projectKey}`;

            const headers = {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            };

            const body = new URLSearchParams({
                grant_type: 'password',
                scope: scope,
                username: email,
                password: password,
            }).toString();

            try {
                const response = await fetch(`${ctpAuthUrl}/oauth/${projectKey}/customers/token`, {
                    method: 'POST',
                    headers: headers,
                    body: body,
                });

                if (!response.ok) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }

                const responseData = await response.json();
                res.json({ message: 'Login successful', token: responseData.access_token });
            } catch (error) {
                res.status(500).json({ message: 'Error logging in', error });
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
