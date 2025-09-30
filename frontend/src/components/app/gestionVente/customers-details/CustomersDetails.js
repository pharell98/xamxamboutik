import React from 'react';
import CustomerDetailsHeader from './CustomerDetailsHeader';
import CustomerInfo from './CustomerInfo';
import CustomerLog from './CustomerLog';

const CustomersDetails = () => {
  return (
    <div className="vente-mobile">
      <CustomerDetailsHeader />
      <CustomerInfo />
      <CustomerLog />
    </div>
  );
};

export default CustomersDetails;
