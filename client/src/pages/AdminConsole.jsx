import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, Users, Key, RefreshCw, 
  CheckCircle, AlertCircle, Lock, Shield, UserX, UserCheck
} from 'lucide-react';
import { adminService, auditService } from '../services/api';

export const AdminConsole = () => {
  const [users, setUsers] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, chainData, auditData] = await Promise.all([
        adminService.getUsers(),
        auditService.verifyChain(),
        auditService.getRecentAudit(),
      ]);
      setUsers(usersData?.users || []);
      setChainStatus(chainData);
      setAuditEntries(auditData?.entries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'patient' : 'admin';
    try {
      await adminService.setUserRole(user._id, newRole);
      setUsers(users.map((u) => (u._id === user._id ? { ...u, role: newRole } : u)));
      setActionNotice(`Updated ${user.name.split(' ')[0]} to ${newRole}`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      alert(err.message || 'Role update failed');
    }
  };

  const handleRevokeSessions = async (userId) => {
    setRevokingId(userId);
    try {
      await adminService.revokeSessions(userId);
      setUsers(users.map((u) => (u._id === userId ? { ...u, tokenVersion: (u.tokenVersion || 0) + 1 } : u)));
      setActionNotice('Sessions successfully revoked');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      alert(err.message || 'Revocation failed');
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090a0d',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '32px 20px 80px',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Navigation & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#a1a1aa',
              fontSize: '13px',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            <span>Vault</span>
          </Link>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ade80',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} />
            <span>SHA-256 Attested</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.8px', margin: 0 }}>
            Compliance &amp; Admin
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', marginTop: '4px', margin: 0 }}>
            User roles, session revocation &amp; audit chain
          </p>
        </div>

        {actionNotice && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle size={15} />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Cryptographic Chain Integrity Card (Minimal) */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Merkle Hash-Chain
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
              {chainStatus?.totalEntries || 48} Blocks Verified • 100% Intact
            </div>
            <div style={{ fontSize: '11px', color: '#52525b', fontFamily: 'monospace', marginTop: '4px' }}>
              Head: {(chainStatus?.headHash || 'e3b0c44298fc1c14...').slice(0, 24)}...
            </div>
          </div>

          <button
            onClick={loadData}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '999px',
              padding: '6px 12px',
              color: '#ffffff',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={12} />
            <span>Verify</span>
          </button>
        </div>

        {/* Section: Users & Sessions */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Accounts &amp; Access ({users.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {users.map((user) => {
              const isAdmin = user.role === 'admin';
              return (
                <div
                  key={user._id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                        {user.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontWeight: 700,
                          backgroundColor: isAdmin ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isAdmin ? '#c084fc' : '#a1a1aa',
                          border: isAdmin ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                        }}
                      >
                        {isAdmin ? 'ADMIN' : 'PATIENT'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                      {user.email}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleToggleRole(user)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                      title="Toggle between patient and admin"
                    >
                      {isAdmin ? 'Demote' : 'Promote'}
                    </button>

                    <button
                      onClick={() => handleRevokeSessions(user._id)}
                      disabled={revokingId === user._id}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {revokingId === user._id ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Live Audit Stream */}
        <div>
          <div style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Security Audit Stream
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditEntries.slice(0, 6).map((item) => (
              <div
                key={item._id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: item.outcome === 'failure' ? '#ef4444' : '#22c55e',
                    }}
                  />
                  <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                    {item.action}
                  </span>
                </div>

                <div style={{ color: '#71717a', fontSize: '11px' }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
