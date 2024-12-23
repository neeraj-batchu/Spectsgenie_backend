const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
// Router object
const router = express.Router();
const app = express();

app.use(express.json());
app.use(cors());

// Merchant-specific configurations
const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";

// Sandbox URLs
const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status";

// Redirect URLs
const redirectUrl = "http://localhost:8080/cart";
const successUrl = "http://localhost:8080/cart";
const failureUrl = "http://localhost:8080/payment-failure";

// Endpoint to create payment order
router.post('/create-order', async (req, res) => {
    const { name, mobileNumber, amount } = req.body;
    const orderId = uuidv4();

    const paymentPayload = {
        merchantId: MERCHANT_ID,
        merchantUserId: name,
        mobileNumber: mobileNumber,
        amount: amount * 100, // Convert to smallest currency unit
        merchantTransactionId: orderId,
        redirectUrl: `${redirectUrl}/?id=${orderId}`,
        redirectMode: 'POST',
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    };

    // Create base64 encoded payload and checksum
    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
    const keyIndex = 1;
    const stringToHash = payload + '/pg/v1/pay' + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${keyIndex}`;

    const options = {
        method: 'POST',
        url: MERCHANT_BASE_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payload
        }
    };

    try {
        const response = await axios.request(options);
        // const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
        const redirectUrl = "http://localhost:8080/cart"
        console.log("Redirect URL:", redirectUrl);
        res.status(200).json({ msg: "OK", url: redirectUrl });
    } catch (error) {
        console.error("Error initiating payment:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

// Endpoint to check payment status
router.post('/status', async (req, res) => {
    const merchantTransactionId = req.query.id;

    // Create checksum for status request
    const keyIndex = 1;
    const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256}###${keyIndex}`;

    const options = {
        method: 'GET',
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        },
    };

    try {
        const response = await axios.request(options);
        if (response.data.success === true) {
            console.log("Payment successful:", response.data);
            return res.redirect(successUrl);
        } else {
            console.log("Payment failed:", response.data);
            return res.redirect(failureUrl);
        }
    } catch (error) {
        console.error("Error checking payment status:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to retrieve payment status' });
    }
});

module.exports = router;
