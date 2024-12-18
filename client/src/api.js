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
