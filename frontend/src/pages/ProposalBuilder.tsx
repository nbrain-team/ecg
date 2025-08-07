import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProposalBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Proposal Builder</h1>
      <p>Step {currentStep} of 9</p>
      
      <div className="card">
        <h2>Coming Soon</h2>
        <p>The multi-step proposal builder is being developed.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ProposalBuilder; 