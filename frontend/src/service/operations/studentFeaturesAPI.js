import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror = () => {
            resolve(false);
        }
        document.body.appendChild(script);
    })
}


export async function buyCourse(token, courses, userDetails, navigate, dispatch) {
    const toastId = toast.loading("Loading...");
    try {
        console.log("🔍 Starting payment process...");
        console.log("🔍 Courses:", courses);
        console.log("🔍 User details:", userDetails);
        console.log("🔍 Token available:", !!token);

        //initiate the order
        const orderResponse = await apiConnector("POST", COURSE_PAYMENT_API,
            { courses },
            {
                Authorization: `Bearer ${token}`,
            })

        console.log("🔍 Order response received:", orderResponse);

        if (!orderResponse.data.success) {
            console.error("❌ Order creation failed:", orderResponse.data.message);
            throw new Error(orderResponse.data.message);
        }
        console.log("✅ Order created successfully:", orderResponse.data);

        const orderData = orderResponse.data.data;
        console.log("🔍 Order data received:", orderData);
        console.log("🔍 Razorpay Key:", process.env.REACT_APP_RAZORPAY_KEY_ID ? "Available" : "Not available");
        console.log("🔍 Razorpay Key ID:", process.env.REACT_APP_RAZORPAY_KEY_ID);

        // Real Razorpay payment flow
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

        if (!res) {
            toast.error("RazorPay SDK failed to load");
            return;
        }

        // Check if Razorpay key is available
        if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
            console.error("❌ Razorpay key is missing!");
            toast.error("Payment configuration error. Please contact support.");
            return;
        }

        //options
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            currency: orderData.currency,
            amount: `${orderData.amount}`,
            order_id: orderData.id,
            name: "StudyNotion",
            description: "Thank You for Purchasing the Course",
            image: rzpLogo,
            prefill: {
                name: `${userDetails.firstName}`,
                email: userDetails.email
            },
            handler: function (response) {
                console.log("🔍 Payment handler called with response:", response);
                //send successful wala mail
                sendPaymentSuccessEmail(response, orderData.amount, token);
                //verifyPayment
                verifyPayment({ ...response, courses }, token, navigate, dispatch);
            }
        }

        const paymentObject = new window.Razorpay(options);

        // Set up payment handlers
        paymentObject.on("payment.failed", function (response) {
            toast.error("Payment failed");
            console.log(response.error);
        })

        paymentObject.open();

    }
    catch (error) {
        console.log("PAYMENT API ERROR.....", error);
        toast.error("Could not make Payment");
    }
    finally {
        toast.dismiss(toastId);
    }
}

async function sendPaymentSuccessEmail(response, amount, token) {
    try {
        console.log("Sending payment success email from frontend...");
        const emailResponse = await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        })
        console.log("Payment success email response:", emailResponse.data);
    }
    catch (error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
        // Don't fail the payment process if email fails
        console.log("Continuing with payment verification despite email error");
    }
}

//verify payment
async function verifyPayment(bodyData, token, navigate, dispatch) {
    console.log("🔍 Starting payment verification...");
    console.log("🔍 Verification body data:", bodyData);
    const toastId = toast.loading("Verifying Payment....");
    dispatch(setPaymentLoading(true));
    try {
        const response = await apiConnector("POST", COURSE_VERIFY_API, bodyData, {
            Authorization: `Bearer ${token}`,
        })

        console.log("Payment verification response:", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        toast.success("payment Successful, you are added to the course");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());
    }
    catch (error) {
        console.log("PAYMENT VERIFY ERROR....", error);
        toast.error("Could not verify Payment");
    }
    finally {
        toast.dismiss(toastId);
        dispatch(setPaymentLoading(false));
    }
}