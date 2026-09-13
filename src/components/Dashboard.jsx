import UploadZone from './UploadZone.jsx';
import Sidebar from './Sidebar.jsx';

/**
 * Dashboard — Full student workspace UI.
 */
export default function Dashboard({ onUpload }) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  return (
    <div className="workspace">
      <Sidebar />
      
      <main className="workspace__main">
        {/* Welcome Header */}
        <header className="workspace__header">
          <div>
            <h1 className="workspace__welcome">Welcome back, Student 👋</h1>
            <p className="workspace__date">{currentDate}</p>
          </div>
          <div className="workspace__profile">
            <div className="workspace__avatar">S</div>
          </div>
        </header>

        {/* Quick Stats (Placeholders) */}
        <div className="workspace__stats">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--blue">📝</div>
            <div className="stat-card__info">
              <span className="stat-card__value">12</span>
              <span className="stat-card__label">Notes Generated</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--purple">🧠</div>
            <div className="stat-card__info">
              <span className="stat-card__value">45</span>
              <span className="stat-card__label">Questions Answered</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--orange">⏱️</div>
            <div className="stat-card__info">
              <span className="stat-card__value">4.5h</span>
              <span className="stat-card__label">Study Time</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="workspace__content">
          {/* Upload Section */}
          <div className="workspace__upload-section">
            <h2 className="workspace__section-title">Generate New Notes</h2>
            <div className="workspace__upload-card">
              <UploadZone onUpload={onUpload} />
            </div>
          </div>

          {/* Recent Activity (Placeholders) */}
          <div className="workspace__recent-section">
            <h2 className="workspace__section-title">Recent Activity</h2>
            <div className="recent-list">
              <div className="recent-card">
                <div className="recent-card__icon">📄</div>
                <div className="recent-card__details">
                  <h4>Computer Networks - Chapter 4</h4>
                  <p>Generated 2 days ago</p>
                </div>
                <button className="btn btn--ghost">View</button>
              </div>
              <div className="recent-card">
                <div className="recent-card__icon">📄</div>
                <div className="recent-card__details">
                  <h4>Intro to Machine Learning</h4>
                  <p>Generated 5 days ago</p>
                </div>
                <button className="btn btn--ghost">View</button>
              </div>
              <div className="recent-card">
                <div className="recent-card__icon">📄</div>
                <div className="recent-card__details">
                  <h4>Data Structures Midterm Prep</h4>
                  <p>Generated 1 week ago</p>
                </div>
                <button className="btn btn--ghost">View</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
