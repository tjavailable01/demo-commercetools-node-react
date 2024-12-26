import React, { useEffect, useState } from 'react';
import { getCartByCustomerId, removeFromCart } from '../api';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const customerId = localStorage.getItem('customerId');
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await getCartByCustomerId(customerId, token);
                setCart(response);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cart:', error);
                setError('Error fetching cart');
                setLoading(false);
            }
        };

        fetchCart();
    }, [customerId, token]);

    const handleRemove = async (lineItemId) => {
        try {
            const cartId = cart.id;
            const response = await removeFromCart(cartId, lineItemId, token);
            setCart(response);
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="cart">
            <h2>Your Cart</h2>
            {cart && cart.lineItems.length > 0 ? (
                <ul>
                    {cart.lineItems.map(item => (
                        <li key={item.id}>
                            <img src={item.variant.images[0]?.url} alt={item.name.en} />
                            <p>{item.name.en}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: {(item.price.value.centAmount / 100).toFixed(2)} {item.price.value.currencyCode}</p>
                            <button onClick={() => handleRemove(item.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
};

export default Cart;
