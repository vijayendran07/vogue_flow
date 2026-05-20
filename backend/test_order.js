

async function testCreateOrder() {
    try {
        const orderData = {
            shippingInfo: {
                name: 'Test Customer',
                email: 'test@example.com',
                phoneNo: 1234567890,
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                country: 'Test Country',
                pinCode: 123456
            },
            billingInfo: {
                name: 'Test Customer',
                email: 'test@example.com',
                phoneNo: 1234567890,
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                country: 'Test Country',
                pinCode: 123456
            },
            orderItems: [
                {
                    name: 'Test Product',
                    price: 100,
                    quantity: 1,
                    image: 'https://via.placeholder.com/150',
                    product: '60f1b9b9b9b9b9b9b9b9b9b9' // Fake valid ObjectId
                }
            ],
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            itemsPrice: 100,
            taxPrice: 5,
            shippingPrice: 10,
            totalPrice: 115
        };

        const response = await fetch('http://localhost:5000/api/v1/order/new', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Success:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

testCreateOrder();
