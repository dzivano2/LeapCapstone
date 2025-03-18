import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";

const PaymentModal = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error(error);
    } else {
      console.log("PaymentMethod:", paymentMethod);
      onClose(); // Close the form after successful payment
    }

    setLoading(false);
  };

  return (
    <div className="payment-modal">
      <form onSubmit={handleSubmit}>
        <CardElement />
        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Processing..." : "Pay"}
        </button>
      </form>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default PaymentModal;
