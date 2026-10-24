import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, api } from '../services/api';

const AuthContext = createContext();

// Family members created while the server was unreachable get a local slot
// They are clearly marked so a later server sync can reconcile them.
const OFFLINE_MEMBER_PREFIX = 'offline-';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medisage_family_members') || '[]');
    } catch {
      return [];
    }
  });
  const [activeMemberId, setActiveMemberIdState] = useState(
    () => localStorage.getItem('medisage_active_member') || null
  );

  useEffect(() => {
    let cancelled = false;
    // Server-verified bootstrap instead of trusting localStorage: an expired
    // session is rotated once, an invalid one is cleared, and offline mode
    // gracefully keeps the cached profile.
    const initAuth = async () => {
      try {
        const currentUser = await authService.bootstrapAuth();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh the household vault from the server once a live session exists.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/family');
        if (cancelled) return;
        const members = Array.isArray(res.data) ? res.data : [];
        setFamilyMembers(members);
        localStorage.setItem('medisage_family_members', JSON.stringify(members));
      } catch {
        // Offline: keep the cached list
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ----- household vault (server-backed, offline-tolerant) --------------

  const cacheMembers = (members) => {
    setFamilyMembers(members);
    localStorage.setItem('medisage_family_members', JSON.stringify(members));
  };

  const loadFamily = async () => {
    try {
      const res = await api.get('/family');
      if (Array.isArray(res.data)) cacheMembers(res.data);
      return res.data;
    } catch {
      return familyMembers; // offline: cached list
    }
  };

  const addFamilyMember = async (data) => {
    const snapshot = familyMembers;
    const optimistic = {
      _id: OFFLINE_MEMBER_PREFIX + Date.now(),
      name: data.name,
      relationship: data.relationship,
      dateOfBirth: data.dateOfBirth,
      bloodGroup: data.bloodGroup || 'O+ Positive',
      allergies: data.allergies || [],
      chronicConditions: data.chronicConditions || [],
      createdAt: new Date().toISOString(),
      offline: true,
    };
    cacheMembers([optimistic, ...snapshot]);
    try {
      const res = await api.post('/family', data);
      if (res.data?.member) {
        // Swap the placeholder for the real server row, keeping everything else
        cacheMembers([...snapshot, res.data.member]);
        return res.data.member;
      }
      return optimistic;
    } catch {
      return optimistic; // offline mode: pristine local entry
    }
  };

  const updateFamilyMember = async (id, patch) => {
    try {
      const res = await api.put(`/family/${id}`, patch);
      if (res.data?.member) {
        cacheMembers(familyMembers.map((m) => (m._id === id ? res.data.member : m)));
        return res.data.member;
      }
    } catch {
      // offline fallback mirrored below
    }
    const updated = familyMembers.map((m) => (m._id === id ? { ...m, ...patch } : m));
    cacheMembers(updated);
    return updated.find((m) => m._id === id);
  };

  const deleteFamilyMember = async (id) => {
    const snapshot = familyMembers;
    cacheMembers(familyMembers.filter((m) => m._id !== id));
    if (activeMemberId === id) setActiveMember(null);
    try {
      await api.delete(`/family/${id}`);
      return { success: true };
    } catch {
      cacheMembers(snapshot); // restore on failure (server reachable but refused)
      return { success: false };
    }
  };

  // ----- active profile viewing -----------------------------------------

  const setActiveMember = (memberId) => {
    setActiveMemberIdState(memberId);
    if (memberId) localStorage.setItem('medisage_active_member', memberId);
    else localStorage.removeItem('medisage_active_member');
  };

  const activeMember = familyMembers.find((m) => m._id === activeMemberId) || null;

  // "user" is the effective identity for ALL consuming pages: when a
  // dependent profile is being viewed, the visible demographics come from
  // the family member while the session/permissions remain the owner's.
  const effectiveUser =
    activeMember && user
      ? {
          ...user,
          _id: activeMember._id,
          name: activeMember.name,
          relationship: activeMember.relationship,
          bloodGroup: activeMember.bloodGroup || user.bloodGroup,
          dateOfBirth: activeMember.dateOfBirth || user.dateOfBirth,
          allergies: activeMember.allergies || [],
          chronicConditions: activeMember.chronicConditions || [],
          emergencyContact: activeMember.emergencyContact || user.emergencyContact,
          onboarded: true, // dependents never run through owner onboarding
        }
      : user;

  // ----- exported actions -----------------------------------------------

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const loginDemo = async () => {
    const data = await authService.loginDemo();
    setUser(data.user);
    return data;
  };

  const loginWithGoogle = async (googleData) => {
    const data = await authService.googleAuth(googleData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setActiveMember(null);
    cacheMembers([]);
  };

  // Server-persisted profile edits with optimistic local merge (offline-safe).
  // While a dependent profile is active the write targets that member's row
  // (offline drafts merge locally only — no accidental write to the owner).
  const updateProfile = async (updates) => {
    if (activeMember && user && activeMember._id !== user._id) {
      const { name, email, ...memberPatch } = updates;
      const member = await updateFamilyMember(activeMember._id, {
        ...(name ? { name } : {}),
        ...(memberPatch.bloodGroup ? { bloodGroup: memberPatch.bloodGroup } : {}),
        ...(memberPatch.dateOfBirth ? { dateOfBirth: memberPatch.dateOfBirth } : {}),
        ...(memberPatch.allergies ? { allergies: memberPatch.allergies } : {}),
        ...(memberPatch.chronicConditions ? { chronicConditions: memberPatch.chronicConditions } : {}),
        ...(memberPatch.emergencyContact ? { emergencyContact: memberPatch.emergencyContact } : {}),
      });
      return effectiveUser;
    }
    const updated = await authService.updateProfile(updates);
    if (updated) setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        accountUser: user, // the real session owner (never the viewed dependent)
        isAuthenticated: !!user,
        loading,
        familyMembers,
        activeMemberId,
        activeMember,
        isViewingDependent: Boolean(activeMember),
        loadFamily,
        addFamilyMember,
        updateFamilyMember,
        deleteFamilyMember,
        setActiveMember,
        login,
        register,
        loginDemo,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
