const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
require("dotenv").config();

// Router object
const router = express.Router();
const app = express();
const authenticateToken = require("../middleware/authentiactToken"); // Import the middleware
const { addTransactionDetails } = require("../controller/transaction");

app.use(express.json());
app.use(cors());

// Merchant-specific configurations
const MERCHANT_KEY = "14fa5465-f8a7-443f-8477-f986b8fcfde9";
const MERCHANT_ID = "PGTESTPAYUAT77";

// Sandbox URLs
const MERCHANT_BASE_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
const MERCHANT_STATUS_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status";

// Redirect URLs
const redirectUrl = "http://localhost:8080/api/phonepe/status";
const successUrl = "http://localhost:3000/payment-success";
const failureUrl = "http://localhost:3000/payment-failure";

// Global paymentPayload
let paymentPayload = {};
let orderIds = "";

const sendWhatsAppMessage = async (phoneNumber, message) => {
  const formattedPhoneNumber = `91${phoneNumber}`;
  const url = "https://bdwamaster.online/api/send";
  const params = {
    number: formattedPhoneNumber,
    type: "text",
    message: message,
    instance_id: process.env.INSTANCE_ID,
    access_token: process.env.WHATSAPP_ACCESS_TOKEN,
  };

  try {
    const response = await axios.get(url, { params });
    if (response.data.status === "success") {
      console.log("WhatsApp message sent successfully:", response.data);
    } else {
      console.error("Failed to send WhatsApp message:", response.data);
    }
  } catch (error) {
    console.error(
      "Error sending WhatsApp message:",
      error.response?.data || error.message
    );
  }
};

// Endpoint to create payment order
router.post("/create-order", async (req, res) => {
  const {
    name,
    mobileNumber,
    amount,
    orderData,
    addressId,
    userId,
    address,
    discountCode,
  } = req.body;
  const orderId = uuidv4();
  orderIds = orderId;

  // Populate global paymentPayload
  paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: amount * 100, // Convert to smallest currency unit
    user_id: userId,
    addressId: addressId.id,
    orderData: orderData,
    merchantTransactionId: orderId,
    address: addressId,
    discountCode: discountCode,
    redirectUrl: `${redirectUrl}/?id=${orderId}`,
    redirectMode: "POST",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  console.log(paymentPayload);

  // Create base64 encoded payload and checksum
  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
    "base64"
  );
  const keyIndex = 1;
  const stringToHash = payload + "/pg/v1/pay" + MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const checksum = `${sha256}###${keyIndex}`;

  const options = {
    method: "POST",
    url: MERCHANT_BASE_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payload,
    },
  };

  try {
    const response = await axios.request(options);
    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
    console.log("Redirect URL:", redirectUrl);
    res.status(200).json({ msg: "OK", url: redirectUrl });
  } catch (error) {
    console.error(
      "Error initiating payment:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

router.post("/status", async (req, res) => {
  const merchantTransactionId = req.query.id;

  const keyIndex = 1;
  const stringToHash =
    `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  const checksum = `${sha256}###${keyIndex}`;

  const options = {
    method: "GET",
    url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": MERCHANT_ID,
    },
  };

  try {
    const response = await axios.request(options);
    const responseData = response.data;

    // Insert transaction details
    const transactionDetails = {
      transactionId: responseData.transactionId || "",
      code: responseData.code || "",
      providerReferenceId: responseData.providerReferenceId || "",
      order_id: merchantTransactionId,
      amount: responseData.amount || paymentPayload.amount,
    };

    await db.query(
      `INSERT INTO sg_order_transactions (transactionId, code, providerReferenceId, order_id, amount)
             VALUES (?, ?, ?, ?, ?)`,
      [
        transactionDetails.transactionId,
        transactionDetails.code,
        transactionDetails.providerReferenceId,
        transactionDetails.order_id,
        transactionDetails.amount,
      ]
    );

    // Prepare orderDetails for the update
    const orderDetails = {
      customer_id: paymentPayload.user_id,
      address_id: paymentPayload.addressId,
      total_amount: paymentPayload.amount / 100, // Convert back to major currency unit
      actual_total_amount: paymentPayload.amount / 100, // Assuming no additional charges
      discount: 0, // Assuming no discount
      discount_code: paymentPayload.discountCode, // Assuming no discount code
      quantity: paymentPayload.orderData.quantity || 1, // Assuming single quantity
      order_status: responseData.success ? "Completed" : "Failed",
      parent_product_id: paymentPayload.orderData.parentProductId || null,
      lens_type_id: paymentPayload.orderData.lensTypeId || null,
      category_id: paymentPayload.orderData.categoryId || null,
      lens_package_id: paymentPayload.orderData.lensPackageId || null,
      order_id: merchantTransactionId,
      product_id: paymentPayload.orderData.productId || null,
    };

    const orderDataString = JSON.stringify(paymentPayload.orderData || {});

    await db.query(
      `INSERT INTO sg_orders_online
             (id, order_id, customer_id, address_id, total_amount, actual_total_amount, discount, discount_code, order_status, order_data)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        0,
        paymentPayload.merchantTransactionId,
        orderDetails.customer_id,
        orderDetails.address_id,
        orderDetails.total_amount,
        orderDetails.actual_total_amount,
        orderDetails.discount,
        orderDetails.discount_code,
        "Active",
        orderDataString, // Ensure serialized JSON
      ]
    );

    const orderDetailsMess = paymentPayload.orderData;
    const addressMessage = `
    ${paymentPayload.address.address_name}
    ${paymentPayload.address.address_line_1}
    ${paymentPayload.address.address_line_2}
    ${paymentPayload.address.city}
    ${paymentPayload.address.state}
    ${paymentPayload.address.pincode}
    ${paymentPayload.address.country}
`;
    const message = `
New Order Received:
Name: ${paymentPayload.merchantUserId}
User ID: ${paymentPayload.user_id}
Order ID: ${paymentPayload.merchantTransactionId}
Address: ${addressMessage}
        
         


Order Details:
${orderDetailsMess
  .map(
    (order) => `
- Product Name: ${order.pr_name}
  SKU: ${order.pr_sku}
  Quantity: ${order.quantity_per_box || 1}
  Price: ₹${order.pr_price}
  Lens Package: ${order.lens_package_name}
`
  )
  .join("")}
        `;

    // Send WhatsApp message to the vendor
    const vendorPhoneNumber = process.env.PHONE_NUMBER; // Replace with the vendor's phone number
    await sendWhatsAppMessage(vendorPhoneNumber, message);

    if (responseData.success) {
      console.log("Payment successful:", responseData);
      return res.redirect(successUrl);
    } else {
      console.log("Payment failed:", responseData);
      return res.redirect(failureUrl);
    }
  } catch (error) {
    console.error(
      "Error checking payment status:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to retrieve payment status" });
  }
});

router.post("/addTransaction", authenticateToken, addTransactionDetails);

module.exports = router;
