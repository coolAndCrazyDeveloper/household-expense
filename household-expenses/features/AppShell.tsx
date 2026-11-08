'use client';

import { useState } from 'react';

import type { AppTab, ExpenseDraft } from '../common/types';

import { AppHeader } from '../components/layout/AppHeader';
import { BottomNavigation } from '../components/layout/BottomNavigation';

import { Alert } from '../components/atoms/Alert';
import { Button } from '../components/atoms/Button';

import { DashboardView } from './dashboard/DashboardView';
import { AddExpenseView } from './expenses/AddExpenseView';
import { HistoryView } from './history/HistoryView';
import { MemberSettingsView } from './settings/MemberSettingsView';

import {
  addExpense,
  updateExpense,
  deleteExpense,
  deleteExpenseMonth,
} from '../lib/supabase/queries';

import { useApp } from '../providers/AppProvider';

export function AppShell() {
  const {
    user,
    members,
    expenses,
    loading,
    error,
    refresh,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [actionError, setActionError] = useState('');

  if (loading) {
    return (
      <main className="loading-screen">
        <span className="loader" />
        Connecting to Supabase…
      </main>
    );
  }

  if (!user) {
    return (
      <main className="app-shell">
        <div className="app-content">
          <Alert>
            {error ||
              'Could not connect to Supabase. Check your .env.local values and enable Anonymous Sign-Ins in Supabase Authentication settings.'}
          </Alert>

          <Button
            fullWidth
            onClick={() => window.location.reload()}
          >
            Retry connection
          </Button>
        </div>
      </main>
    );
  }

  if (!members.length) {
    return (
      <main className="app-shell">
        <div className="app-content">
          <Alert>
            No household members found. Run the updated supabase/schema.sql
            script in Supabase SQL Editor.
          </Alert>
        </div>
      </main>
    );
  }

  async function saveExpense(draft: ExpenseDraft) {
    setActionError('');

    try {
      await addExpense(user?.id || '', draft);
      await refresh();
      setActiveTab('dashboard');
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to save expense.'
      );
      throw error;
    }
  }

  async function editExpense(
    id: string,
    changes: { item: string; amount: number }
  ) {
    setActionError('');

    try {
      await updateExpense(id, changes);
      await refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to update expense.'
      );
      throw error;
    }
  }

  async function removeExpense(id: string) {
    setActionError('');

    try {
      await deleteExpense(id);
      await refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to delete expense.'
      );
      throw error;
    }
  }

  async function removeMonth(month: string) {
    setActionError('');

    try {
      await deleteExpenseMonth(month);
      await refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to delete month.'
      );
      throw error;
    }
  }

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="app-content">
        {(error || actionError) && (
          <Alert>{actionError || error}</Alert>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            expenses={expenses}
            members={members}
            onAdd={() => setActiveTab('add')}
            onHistory={() => setActiveTab('history')}
            onUpdateExpense={editExpense}
            onDeleteExpense={removeExpense}
          />
        )}

        {activeTab === 'add' && (
          <AddExpenseView
            members={members}
            onSave={saveExpense}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            expenses={expenses}
            members={members}
            onDeleteMonth={removeMonth}
            onUpdateExpense={editExpense}
            onDeleteExpense={removeExpense}
          />
        )}

        {activeTab === 'settings' && (
          <MemberSettingsView
            members={members}
            onSaved={refresh}
          />
        )}
      </div>

      <BottomNavigation
        active={activeTab}
        onChange={setActiveTab}
      />
    </main>
  );
}