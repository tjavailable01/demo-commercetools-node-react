import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById } from '../api';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const response = await getProductById(id);
                setProduct(response);
                setSelectedVariant(response.masterData.current.masterVariant);
                setLoading(false);
            } catch (err) {
                setError('Error fetching product details');
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [id]);

    const handleVariantChange = (variantId) => {
        console.log("variantId", variantId);
        const selected = product.masterData.current.variants.find(v => v.sku === variantId) || product.masterData.current.masterVariant;
        console.log("variant", selected);
        setSelectedVariant(selected);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    /*return (
        <div>
            <h1>{product.masterData.current.name.en}</h1>
            <img src={product.masterData.current.masterVariant.images[0]?.url} alt={product.masterData.current.name.en} />
            <p>Price: ${(product.masterData.current.masterVariant.prices[0].value.centAmount / 100).toFixed(product.masterData.current.masterVariant.prices[0].value.fractionDigits)}</p>
        </div>
    );*/
    return (
        <div className="product-detail">
            <h2>{product.masterData.current.name.en}</h2>
            <img src={selectedVariant.images[0]?.url} alt={product.masterData.current.name.en}/>
            <p>{(selectedVariant.prices[0].value.centAmount / 100).toFixed(selectedVariant.prices[0].value.fractionDigits)} {selectedVariant.prices[0].value.currencyCode}</p>
            <h3>Variants</h3>
            <select onChange={(e) => handleVariantChange(e.target.value)}>
                <option
                    value={product.masterData.current.masterVariant.id}>{product.masterData.current.masterVariant.sku}</option>
                {product.masterData.current.variants.map((variant) => (
                    <option key={variant.sku} value={variant.sku}>{variant.sku}</option>
                ))}
            </select>
        </div>
    );
};

export default ProductDetails;
