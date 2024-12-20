import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductById, getCategoryById, addToCart, removeFromCart } from '../api';

const ProductDetails = () => {
    const { id } = useParams();
    const [message, setMessage] = useState('');
    const [categoryDetails, setCategoryDetails] = useState([]);
    const [ancestorDetails, setAncestorDetails] = useState([]);
    const [product, setProduct] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [token, setToken] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isLoggedIn = Boolean(localStorage.getItem('token'));

    useEffect(() => {
        //Function to Fetch Product Details
        const fetchProductDetails = async () => {
            try {
                //Get Product Details By id
                const response = await getProductById(id);
                //Save all the product details
                setProduct(response);
                //Save all the product variants
                setSelectedVariant(response.masterData.current.masterVariant);

                //Get all the category Ids
                const categoryIds = response.masterData.current.categories.map(category => category.id);
                //Get the category Details
                const categories = await fetchCategoryDetails(categoryIds);
                //Save the category Details
                setCategoryDetails(categories);

                //Get the category ancestor Details
                const ancestors = await fetchAncestorDetails(categories);
                //Save the category ancestor Details
                setAncestorDetails(ancestors);
                //Stop the loader
                setLoading(false);
                setCustomerId(localStorage.getItem('customerId'));
                setToken(localStorage.getItem('token'));

            } catch (err) {
                console.log("Error fetching product details:", err);
                setError('Error fetching product details');
                setLoading(false);
            }
        };

        //Function to Category Details
        const fetchCategoryDetails = async (categoryIds) => {
            const categoryDetails = [];

            for (const categoryId of categoryIds) {
                try {
                    const categoryResponse = await getCategoryById(categoryId);
                    categoryDetails.push(categoryResponse);
                    //console.log(`Category Details for ${categoryId}:`, categoryResponse);
                } catch (error) {
                    console.error(`Error fetching details for category ${categoryId}:`, error);
                }
            }
            return categoryDetails;
        };

        //Function to Ancestor Category Details
        const fetchAncestorDetails = async (categories) => {
            const ancestorIds = categories.flatMap(category =>
                category.ancestors.map(ancestor => ancestor.id)
            );
            const ancestorDetails = [];
            for (const ancestorId of ancestorIds) {
                try {
                    const ancestorResponse = await getCategoryById(ancestorId);
                    ancestorDetails.push(ancestorResponse);
                    //console.log(`Ancestor Details for ${ancestorId}:`, ancestorResponse);
                } catch (error) {
                    console.error(`Error fetching details for ancestor ${ancestorId}:`, error);
                }
            }
            return ancestorDetails;
        };
        //Invoke the fetch Product Details function
        fetchProductDetails();
    }, [id]);

    //Get Product Variations
    const handleVariantChange = (variantId) => {
        //Get Product variant Details
        const selected = product.masterData.current.variants.find(v => v.sku === variantId) || product.masterData.current.masterVariant;
        //Save Product variant Details
        setSelectedVariant(selected);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    //Get Product Attributes
    const getAttribute = (attributes, name) => {
        const attribute = attributes.find(attr => attr.name === name);
        return attribute ? attribute.value : 'N/A';
    };
    const handleAddToCart = async (customerId, productId, variantId, quantity) => {
        try {
            // const quantity = 1;
            const response = await addToCart(customerId, productId, variantId, quantity);
            setMessage('Product added to cart successfully.');
        } catch (error) {
            console.log("Error",error);
            setMessage('Error adding product to cart.');
        }
    };

    return (
        <div className="product-detail">
            <h2>{product.masterData.current.name.en}</h2>
            <img src={selectedVariant.images[0]?.url} alt={product.masterData.current.name.en}/>
            <p> Price: {(selectedVariant.prices[0].value.centAmount / 100).toFixed(selectedVariant.prices[0].value.fractionDigits)} {selectedVariant.prices[0].value.currencyCode} </p>
            <p>Size: {getAttribute(selectedVariant.attributes, 'size')}</p>
            <p>Color: {getAttribute(selectedVariant.attributes, 'color').label.en}</p>
            <p>Style: {getAttribute(selectedVariant.attributes, 'style').label}</p>
            <p>Gender: {getAttribute(selectedVariant.attributes, 'gender').label}</p>
            <p>Designer: {getAttribute(selectedVariant.attributes, 'designer').label}</p>
            <p>Article Manufacturer Number: {getAttribute(selectedVariant.attributes, 'articleNumberManufacturer')}</p>
            <h3>Variants</h3>
            <select onChange={(e) => handleVariantChange(e.target.value)}>
                <option value={product.masterData.current.masterVariant.id}>{product.masterData.current.masterVariant.sku}</option>
                {product.masterData.current.variants.map((variant) => (
                    <option key={variant.sku} value={variant.sku}>{variant.sku}</option>))
                }
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
            {isLoggedIn ? (
                <div>
                    <button onClick={() => handleAddToCart(customerId, product.id, selectedVariant.id, 1)}>Add to Cart</button>
                </div>
            ) : (
                <p><a href="/login">Log In to Add Items to Cart</a></p>
            )}
        </div>
    );
};

export default ProductDetails;
