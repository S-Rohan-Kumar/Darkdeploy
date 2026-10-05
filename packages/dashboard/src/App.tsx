import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FlagsTable } from './components/FlagsTable';
import { CreateFlagModal } from './components/CreateFlagModal';
import { FlagDrawer } from './components/FlagDrawer';
import { AuditLogView } from './components/AuditLogView';
import { LoginModal } from './components/LoginModal';
import { ExperimentsView } from './components/ExperimentsView';
import { CreateExperimentModal } from './components/CreateExperimentModal';
import { ExperimentResultsModal } from './components/ExperimentResultsModal';
import { api } from './api/client';
import { Environment, Flag, User, Experiment, Variant } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'flags' | 'experiments' | 'audit'>('flags');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFlagForEdit, setSelectedFlagForEdit] = useState<Flag | null>(null);
  const [isCreateExperimentOpen, setIsCreateExperimentOpen] = useState(false);
  const [selectedExperimentForResults, setSelectedExperimentForResults] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    api
      .getEnvironments()
      .then((envs) => {
        setEnvironments(envs);
        if (envs.length > 0) {
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

  const loadExperiments = async () => {
    if (!selectedEnv) return;
    try {
      const data = await api.getExperiments(selectedEnv.id);
      setExperiments(data);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    }
  };

  useEffect(() => {
    if (selectedEnv) {
      loadFlags();
      loadExperiments();
    }
  }, [selectedEnv]);

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const handleToggleFlag = async (flag: Flag) => {
    const newEnabled = !flag.enabled;
    setFlags((prev) =>
      prev.map((f) => (f.id === flag.id ? { ...f, enabled: newEnabled } : f))
    );

    try {
      await api.updateFlag(flag.id, { enabled: newEnabled });
    } catch (err) {
      console.error('Failed to toggle flag:', err);
      setFlags((prev) =>
        prev.map((f) => (f.id === flag.id ? { ...f, enabled: flag.enabled } : f))
      );
    }
  };

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

  const handleSaveFlag = async (flagId: string, updates: Partial<Flag>) => {
    const updated = await api.updateFlag(flagId, updates);
    setFlags((prev) => prev.map((f) => (f.id === flagId ? updated : f)));
  };

  const handleDeleteFlag = async (flag: Flag) => {
    if (!confirm(`Are you sure you want to delete flag "${flag.name}"?`)) return;
    await api.deleteFlag(flag.id);
    setFlags((prev) => prev.filter((f) => f.id !== flag.id));
  };

  const handleToggleExperiment = async (exp: Experiment) => {
    const newEnabled = !exp.enabled;
    setExperiments((prev) =>
      prev.map((e) => (e.id === exp.id ? { ...e, enabled: newEnabled } : e))
    );

    try {
      await api.updateExperiment(exp.id, { enabled: newEnabled });
    } catch (err) {
      console.error('Failed to toggle experiment:', err);
      setExperiments((prev) =>
        prev.map((e) => (e.id === exp.id ? { ...e, enabled: exp.enabled } : e))
      );
    }
  };

  const handleCreateExperiment = async (data: {
    name: string;
    key: string;
    description: string;
    environmentId: string;
    variants: Variant[];
  }) => {
    const newExp = await api.createExperiment(data);
    setExperiments((prev) => [newExp, ...prev]);
  };

  const handleDeleteExperiment = async (exp: Experiment) => {
    if (!confirm(`Are you sure you want to delete experiment "${exp.name}"?`)) return;
    await api.deleteExperiment(exp.id);
    setExperiments((prev) => prev.filter((e) => e.id !== exp.id));
  };

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
    <div className="flex h-screen w-screen bg-[#0c0e12] text-slate-100 font-sans overflow-hidden">
      <Sidebar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0c0e12]">
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
        ) : activeView === 'experiments' ? (
          <ExperimentsView
            experiments={experiments}
            environment={selectedEnv}
            onToggleExperiment={handleToggleExperiment}
            onViewResults={(exp) => setSelectedExperimentForResults(exp)}
            onDeleteExperiment={handleDeleteExperiment}
            onCreateExperiment={() => setIsCreateExperimentOpen(true)}
          />
        ) : (
          <AuditLogView />
        )}
      </main>

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

      <CreateExperimentModal
        environment={selectedEnv}
        isOpen={isCreateExperimentOpen}
        onClose={() => setIsCreateExperimentOpen(false)}
        onSubmit={handleCreateExperiment}
      />

      <ExperimentResultsModal
        experiment={selectedExperimentForResults}
        isOpen={!!selectedExperimentForResults}
        onClose={() => setSelectedExperimentForResults(null)}
      />
    </div>
  );
};
