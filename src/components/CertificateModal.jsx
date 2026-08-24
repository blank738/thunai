import React, { useRef } from 'react';
import { Award, Download, Printer, X, CheckCircle, ShieldCheck, Heart } from 'lucide-react';

export default function CertificateModal({ isOpen, onClose, donorName, itemName, quantity, orphanageName, ngoName, date }) {
  const certificateRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="card" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Close Button */}
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}
        >
          <X size={20} />
        </button>

        {/* Certificate Printable Canvas */}
        <div 
          ref={certificateRef}
          style={{
            border: '8px double #0d9488',
            borderRadius: '12px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            position: 'relative',
            background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)',
            boxShadow: 'inset 0 0 20px rgba(13, 148, 136, 0.05)'
          }}
        >
          {/* Watermark Logo */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12rem',
            opacity: 0.03,
            pointerEvents: 'none',
            fontWeight: 900
          }}>
            🤝
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Award size={36} color="#0d9488" />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.15em', color: '#0d9488', fontFamily: 'Outfit, sans-serif' }}>
              THUNAI
            </span>
          </div>

          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b' }}>
            Smart Resource Distribution Network
          </span>

          <h2 style={{
            fontSize: '2rem',
            fontFamily: 'Outfit, sans-serif',
            color: '#0f172a',
            margin: '1.25rem 0 0.5rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Certificate of Social Impact
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic' }}>
            This certificate is proudly awarded with gratitude to
          </p>

          <h3 style={{
            fontSize: '1.8rem',
            color: '#0f766e',
            fontFamily: 'Outfit, sans-serif',
            margin: '0.75rem 0',
            borderBottom: '2px solid #99f6e4',
            display: 'inline-block',
            padding: '0 2rem 0.25rem 2rem'
          }}>
            {donorName || 'Distinguished Donor'}
          </h3>

          <p style={{
            fontSize: '0.95rem',
            color: '#334155',
            maxWidth: '560px',
            margin: '1rem auto',
            lineHeight: '1.6'
          }}>
            For contributing <strong>{quantity || 'surplus'} x {itemName || 'resources'}</strong>, which were safely collected and transported by <strong>{ngoName || 'CareConnect NGO'}</strong> and successfully delivered to <strong>{orphanageName || 'Hope Children Home'}</strong>, directly supporting children in need and preventing resource waste.
          </p>

          {/* Certificate Badge Footer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            alignItems: 'center',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.8rem'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{date || new Date().toLocaleDateString()}</div>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Delivery Verified Date</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '2px dashed #0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d9488',
                fontWeight: 800,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                transform: 'rotate(-10deg)',
                backgroundColor: '#f0fdfa'
              }}>
                VERIFIED<br />IMPACT
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#0d9488', fontWeight: 700 }}>
                HopeCircle Trust
              </div>
              <span style={{ color: '#64748b', fontSize: '0.7rem' }}>THUNAI Governing Body</span>
            </div>
          </div>

        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
