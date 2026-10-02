import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FlagsTable } from './components/FlagsTable';
import { CreateFlagModal } from './components/CreateFlagModal';
import { FlagDrawer } from './components/FlagDrawer';
import { AuditLogView } from './components/AuditLogView';
import { LoginModal } from './components/LoginModal';
import { api } from './api/client';
import { Environment, Flag, User } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'flags' | 'audit'>('flags');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFlagForEdit, setSelectedFlagForEdit] = useState<Flag | null>(null);
  const [loading, setLoading] = useState(false);

  // Load environments on auth
  useEffect(() => {
    if (!currentUser) return;

    api
      .getEnvironments()
      .then((envs) => {
        setEnvironments(envs);
        if (envs.length > 0) {
          // Default to development or first environment
          const dev = envs.find((e) => e.key === 'development') || envs[0];
          setSelectedEnv(dev);
        }
      })
      .catch((err) => {
        console.error('Failed to load environments:', err);
        if (err.message.includes('401') || err.message.includes('authorization')) {
          handleLogout();
        }
      });
  }, [currentUser]);

  // Load flags whenever selected environment changes
  const loadFlags = async () => {
    if (!selectedEnv) return;
    setLoading(true);
    try {
      const data = await api.getFlags(selectedEnv.id);
      setFlags(data);
    } catch (err) {
      console.error('Failed to load flags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEnv) {
      loadFlags();
    }
  }, [selectedEnv]);

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  // Live Toggle Master Switch with Optimistic UI
  const handleToggleFlag = async (flag: Flag) => {
    const newEnabled = !flag.enabled;
    // Optimistic update
    setFlags((prev) =>
      prev.map((f) => (f.id === flag.id ? { ...f, enabled: newEnabled } : f))
    );

    try {
      await api.updateFlag(flag.id, { enabled: newEnabled });
    } catch (err) {
      console.error('Failed to toggle flag:', err);
      // Revert on error
      setFlags((prev) =>
        prev.map((f) => (f.id === flag.id ? { ...f, enabled: flag.enabled } : f))
      );
    }
  };

  // Create Flag
  const handleCreateFlag = async (data: {
    name: string;
    key: string;
    description: string;
    defaultValue: boolean;
    rolloutPercentage: number;
    environmentId: string;
  }) => {
    const newFlag = await api.createFlag(data);
    setFlags((prev) => [newFlag, ...prev]);
  };

  // Save updates from drawer (rules, rollout %)
  const handleSaveFlag = async (flagId: string, updates: Partial<Flag>) => {
    const updated = await api.updateFlag(flagId, updates);
    setFlags((prev) => prev.map((f) => (f.id === flagId ? updated : f)));
  };

  // Delete flag
  const handleDeleteFlag = async (flag: Flag) => {
    if (!confirm(`Are you sure you want to delete flag "${flag.name}"?`)) return;
    await api.deleteFlag(flag.id);
    setFlags((prev) => prev.filter((f) => f.id !== flag.id));
  };

  // Filter flags by search
  const filteredFlags = flags.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.key.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q))
    );
  });

  if (!currentUser) {
    return <LoginModal onSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-dark-900 text-slate-100 font-sans overflow-hidden">
      {/* LaunchDarkly-styled Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-dark-900">
        {activeView === 'flags' ? (
          <>
            <Header
              environments={environments}
              selectedEnvironment={selectedEnv}
              onSelectEnvironment={setSelectedEnv}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onCreateFlag={() => setIsCreateOpen(true)}
            />

            {loading ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                Loading flags...
              </div>
            ) : (
              <FlagsTable
                flags={filteredFlags}
                environment={selectedEnv}
                onToggleFlag={handleToggleFlag}
                onConfigureFlag={(flag) => setSelectedFlagForEdit(flag)}
                onDeleteFlag={handleDeleteFlag}
              />
            )}
          </>
        ) : (
          <AuditLogView />
        )}
      </main>

      {/* Modals & Drawers */}
      <CreateFlagModal
        environment={selectedEnv}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateFlag}
      />

      <FlagDrawer
        flag={selectedFlagForEdit}
        isOpen={!!selectedFlagForEdit}
        onClose={() => setSelectedFlagForEdit(null)}
        onSave={handleSaveFlag}
      />
    </div>
  );
};
