import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getCategoryById } from '../api';

const ProductDetails = () => {
    const { id } = useParams();
    const [categoryDetails, setCategoryDetails] = useState([]);
    const [ancestorDetails, setAncestorDetails] = useState([]);
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                console.log("Fetching Product Details");
                const response = await getProductById(id);
                setProduct(response);
                setSelectedVariant(response.masterData.current.masterVariant);

                const categoryIds = response.masterData.current.categories.map(category => category.id);
                console.log("Category IDs:", categoryIds);

                const categories = await fetchCategoryDetails(categoryIds);
                setCategoryDetails(categories);
                const ancestors = await fetchAncestorDetails(categories);
                setAncestorDetails(ancestors);

                setLoading(false);
            } catch (err) {
                console.log("Error fetching product details:", err);
                setError('Error fetching product details');
                setLoading(false);
            }
        };

        const fetchCategoryDetails = async (categoryIds) => {
            const categoryDetails = [];

            for (const categoryId of categoryIds) {
                try {
                    const categoryResponse = await getCategoryById(categoryId);
                    categoryDetails.push(categoryResponse);
                    console.log(`Category Details for ${categoryId}:`, categoryResponse);
                } catch (error) {
                    console.error(`Error fetching details for category ${categoryId}:`, error);
                }
            }
            return categoryDetails;
        };

        const fetchAncestorDetails = async (categories) => {
            const ancestorIds = categories.flatMap(category =>
                category.ancestors.map(ancestor => ancestor.id)
            );

            const ancestorDetails = [];

            for (const ancestorId of ancestorIds) {
                try {
                    const ancestorResponse = await getCategoryById(ancestorId);
                    ancestorDetails.push(ancestorResponse);
                    console.log(`Ancestor Details for ${ancestorId}:`, ancestorResponse);
                } catch (error) {
                    console.error(`Error fetching details for ancestor ${ancestorId}:`, error);
                }
            }

            return ancestorDetails;
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

    return (
        <div className="product-detail">
            <h2>{product.masterData.current.name.en}</h2>
            <img src={selectedVariant.images[0]?.url} alt={product.masterData.current.name.en} />
            <p>{(selectedVariant.prices[0].value.centAmount / 100).toFixed(selectedVariant.prices[0].value.fractionDigits)} {selectedVariant.prices[0].value.currencyCode}</p>
            <h3>Variants</h3>
            <select onChange={(e) => handleVariantChange(e.target.value)}>
                <option value={product.masterData.current.masterVariant.id}>{product.masterData.current.masterVariant.sku}</option>
                {product.masterData.current.variants.map((variant) => (
                    <option key={variant.sku} value={variant.sku}>{variant.sku}</option>
                ))}
            </select>
            <h3>Category Details</h3>
            <ul>
                {categoryDetails.map(category => (
                    <li key={category.id}>{category.name.en}</li>
                ))}
            </ul>
            <h3>Ancestor Details</h3>
            <ul>
                {ancestorDetails.map(ancestor => (
                    <li key={ancestor.id}>{ancestor.name.en}</li>
                ))}
            </ul>
        </div>
    );
};

export default ProductDetails;
