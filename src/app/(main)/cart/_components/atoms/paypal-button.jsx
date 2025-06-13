import React, { useEffect, useRef } from 'react';

const PaypalButton = ({ createOrder, onApprove, onCancel, onError, style }) => {
  const paypalButtonRef = useRef();

  useEffect(() => {
    if (window.paypal) {
      window.paypal
        .Buttons({
          style: {
            color: 'blue',
            shape: 'rect',
            layout: 'vertical',
            ...style, // Allow overriding default styles
          },
          createOrder: (data, actions) => {
            if (createOrder) {
              return createOrder(data, actions);
            }
            return null;
          },
          onApprove: (data, actions) => {
            if (onApprove) {
              return onApprove(data, actions);
            }
            return null;
          },
          onCancel: (data, actions) => {
            if (onCancel) {
              return onCancel(data, actions);
            }
          },
          onError: (err) => {
            if (onError) {
              onError(err);
            }
          },
        })
        .render(paypalButtonRef.current);
    }
  }, [createOrder, onApprove, onCancel, onError, style]);

  return <div ref={paypalButtonRef} />;
};

export default PaypalButton;