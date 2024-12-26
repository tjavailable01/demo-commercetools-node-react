import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getProducts = async (page, limit, category) => {
    const response = await api.get('/products', {
        params: {
            page,
            limit,
            category
        }
    });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};
export const getCategoryById = async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};
export const getCategories = async (id) => {
    const response = await api.get(`/categories`);
    return response.data;
};

export const registerUser = async (email, password, firstName, lastName, key) => {
    const response = await api.post('/register', { email, password, firstName, lastName, key });
    return response.data;
};

export const loginUser = async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

export const addToCart = async (customerId, productId, variantId, quantity) => {
    const response = await api.post('/cart/add', { customerId, productId, variantId, quantity });
    return response.data;
};

export const getCartByCustomerId = async (customerId, token) => {
    console.log("Cart Page 2");
    console.log("customerId", customerId);
    console.log("token", token);
    const response = await api.get('/cart', {
        params: { customerId, token },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

export const removeFromCart = async (cartId, lineItemId, token) => {
    const response = await api.delete('/cart/remove', {
        data: { cartId, lineItemId, token },
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
};



