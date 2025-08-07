import { useNavigate } from 'react-router-dom';

function ProposalView() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Proposal View</h1>
      
      <div className="card">
        <h2>Proposal Details</h2>
        <p>Proposal viewing functionality is being developed.</p>
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

export default ProposalView; 