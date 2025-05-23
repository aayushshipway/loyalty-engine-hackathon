import React, { useState } from 'react';
import './../css/UpdateMerchantStats.css';
import BACKEND_BASE_URL from '../config';

const tabs = ['Shipway', 'Convertway', 'Unicommerce'];

// ✅ Static date values for May 2025
const initialFormState = {
  merchant_id: '',
  from_date: '2025-05-01',
  till_date: '2025-05-31',
  order_count: '',
  billing_amount: '',
  margin_amount: '',
  services_amount: '',
  nps_score: '',
  wallet_share: '',
  delayed_orders: '',
  complaint_count: '',
  average_resolution_tat: '',
  returned_orders: '',
  undelivered_orders: '',
};

const UpdateMerchantStats = () => {
  const [activeTab, setActiveTab] = useState('Shipway');
  const [formData, setFormData] = useState({ ...initialFormState });
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getAPIEndpoint = () => {
    switch (activeTab) {
      case 'Shipway':
        return `${BACKEND_BASE_URL}/user/update-shipway-data`;
      case 'Convertway':
        return `${BACKEND_BASE_URL}/user/update-convertway-data`;
      case 'Unicommerce':
        return `${BACKEND_BASE_URL}/user/update-unicommerce-data`;
      default:
        return '';
    }
  };

  const getRelevantFields = () => {
    if (activeTab === 'Unicommerce') {
      const {
        wallet_share,
        delayed_orders,
        returned_orders,
        undelivered_orders,
        services_amount,
        average_resolution_tat,
        ...rest
      } = formData;
      return rest;
    } else if (activeTab === 'Convertway') {
      const {
        merchant_id,
        from_date,
        till_date,
        order_count,
        billing_amount,
        margin_amount,
        nps_score,
      } = formData;
      return {
        merchant_id,
        from_date,
        till_date,
        order_count,
        billing_amount,
        margin_amount,
        nps_score,
      };
    }
    return formData; // Shipway uses all fields
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(getAPIEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(getRelevantFields()),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Data updated successfully!');
        setIsError(false);
        setFormData((prev) => ({
          ...initialFormState,
          from_date: '2025-05-01',
          till_date: '2025-05-31',
        }));
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    }
  };

  return (
    <div className="update-stats-page container py-4">
      <h2 className="mb-4">Update Merchant Stats</h2>

      <div className="tabs mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setMessage(null);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {message && (
        <div className={`alert ${isError ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <form className="stats-form card p-4" onSubmit={handleSubmit}>
        <div className="row">
          {Object.keys(getRelevantFields()).map((field) => (
            <div className="col-md-6 mb-3" key={field}>
              <label className="form-label text-capitalize">{field.replace(/_/g, ' ')}</label>
              <input
                type={field.includes('date') ? 'date' : 'text'}
                className="form-control"
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
              />
            </div>
          ))}
        </div>
        <button className="btn btn-primary mt-3" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default UpdateMerchantStats;
