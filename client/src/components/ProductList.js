import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts(page, limit, category);
                setProducts(response);
                setLoading(false);
            } catch (err) {
                setError('Error fetching products');
                setLoading(false);
            }
        };
        fetchProducts();
    }, [page, limit, category]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Product Listing</h1>

            <select onChange={handleCategoryChange} value={category}>
                <option value="">All Categories</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name.en}</option>
                ))}
            </select>

            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        <Link to={`/products/${product.id}`}>
                            <h2>{product.masterData.current.name.en}</h2>
                            <img src={product.masterData.current.masterVariant.images[0]?.url} alt={product.masterData.current.name.en} />
                            <p>Price: {(product.masterData.current.masterVariant.prices[0].value.centAmount / 100).toFixed(product.masterData.current.masterVariant.prices[0].value.fractionDigits)}</p>
                        </Link>
                    </li>
                ))}
            </ul>

            <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
            <button onClick={handleNextPage}>Next</button>
        </div>
    );
};

export default ProductList;
