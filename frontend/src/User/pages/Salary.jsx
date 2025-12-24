import React, { useState } from 'react';
import './salary.css';


const App = () => {
  const [monthlySalary, setMonthlySalary] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [bonus, setBonus] = useState('');
  const [benefits, setBenefits] = useState('');

  // Calculations
  const grossAnnual = (parseFloat(monthlySalary || 0) * 12) + parseFloat(bonus || 0) + parseFloat(benefits || 0);
  const taxAmount = (grossAnnual * (parseFloat(taxRate || 0) / 100));
  const netAnnual = grossAnnual - taxAmount;
  const netMonthly = netAnnual / 12;

  return (
    <div className="calculator-container">
      <h1>💰 Salary Calculator</h1>

      <div className="form-group">
        <label>Monthly Salary (₹)</label>
        <input
          type="number"
          value={monthlySalary}
          onChange={(e) => setMonthlySalary(e.target.value)}
          placeholder="e.g. 50000"
        />
      </div>

      <div className="form-group">
        <label>Tax Rate (%)</label>
        <input
          type="number"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
          placeholder="e.g. 10"
        />
      </div>

      <div className="form-group">
        <label>Annual Bonus (₹)</label>
        <input
          type="number"
          value={bonus}
          onChange={(e) => setBonus(e.target.value)}
          placeholder="e.g. 50000"
        />
      </div>

      <div className="form-group">
        <label>Benefits Value (₹)</label>
        <input
          type="number"
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
          placeholder="e.g. 20000"
        />
      </div>

      <div className="results">
        <h3>🧾 Calculation Summary</h3>
        <p><strong>Gross Annual Salary:</strong> ₹{grossAnnual.toFixed(2)}</p>
        <p><strong>Estimated Tax:</strong> ₹{taxAmount.toFixed(2)}</p>
        <p><strong>Net Annual Salary:</strong> ₹{netAnnual.toFixed(2)}</p>
        <p><strong>Net Monthly Salary:</strong> ₹{netMonthly.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default App;
