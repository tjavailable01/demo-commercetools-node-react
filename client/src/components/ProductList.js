import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getProducts();
                console.log("Response2",response);
                setProducts(response);
                setLoading(false);
            } catch (err) {
                setError('Error fetching products');
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Product Listing</h1>
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
        </div>
    );
};

export default ProductList;
