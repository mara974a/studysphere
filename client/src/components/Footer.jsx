import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} color="#818cf8" />
          <strong style={{ color: 'var(--text-primary)' }}>StudySphere</strong>
          <span>— Full-Stack Academic Resources Hub</span>
        </div>
        <p>
          Built with React (Vite), Express.js, MongoDB Atlas (Mongoose), JWT & Bcrypt.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
