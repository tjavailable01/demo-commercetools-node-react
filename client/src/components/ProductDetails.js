import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../api';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await getProductById(id);
                setProduct(response);
                setLoading(false);
            } catch (err) {
                setError('Error fetching product details');
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>{product.masterData.current.name.en}</h1>
            <img src={product.masterData.current.masterVariant.images[0]?.url} alt={product.masterData.current.name.en} />
            <p>Price: ${(product.masterData.current.masterVariant.prices[0].value.centAmount / 100).toFixed(product.masterData.current.masterVariant.prices[0].value.fractionDigits)}</p>
        </div>
    );
};

export default ProductDetails;
