'use client';
import { useEffect, useState } from 'react';
import { Save, Users } from 'lucide-react';
import type { HouseholdMember } from '../../common/types';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Alert } from '../../components/atoms/Alert';
import { updateCommonShares } from '../../lib/supabase/queries';

export function MemberSettingsView({ members, onSaved }: { members: HouseholdMember[]; onSaved: () => Promise<void> }) {
  const [shares, setShares] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => setShares(Object.fromEntries(members.map((member) => [member.id, String(member.common_share_percent)]))), [members]);
  const total = members.reduce((sum, member) => sum + Number(shares[member.id] ?? 0), 0);

  async function save() {
    setMessage(''); setError('');
    const values = members.map((member) => ({ id: member.id, common_share_percent: Number(shares[member.id]) }));
    if (values.some((value) => !Number.isFinite(value.common_share_percent) || value.common_share_percent < 0 || value.common_share_percent > 100)) { setError('Each share must be between 0 and 100.'); return; }
    if (Math.abs(values.reduce((sum, value) => sum + value.common_share_percent, 0) - 100) > 0.0001) { setError('Common shares must add up to exactly 100%.'); return; }
    setSaving(true);
    try { await updateCommonShares(values); await onSaved(); setMessage('Common split saved successfully.'); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to save common split.'); }
    finally { setSaving(false); }
  }

  return <>
    <div className="page-heading"><div><span className="eyebrow">HOUSEHOLD PREFERENCES</span><h1>Settings</h1></div></div>
    <section className="panel settings-panel">
      <div className="settings-title"><Users size={19}/><div><b>Household members</b><small>{members.length} configured members</small></div></div>
      <div className="field"><label>Members and common expense share</label><p className="field-hint">These percentages decide how Common expenses are allocated. They must total 100%.</p></div>
      {members.map((member) => <div className="share-row" key={member.id}><span><b>{member.display_name}</b><small>Fixed household member</small></span><div className="percent-input"><Input label={`${member.display_name} common share`} aria-label={`${member.display_name} common share`} type="number" min="0" max="100" step="0.0001" value={shares[member.id] ?? ''} onChange={(event) => setShares((current) => ({ ...current, [member.id]: event.target.value }))}/><b>%</b></div></div>)}
      <div className={`share-total ${Math.abs(total - 100) < 0.0001 ? 'valid' : 'invalid'}`}>Total common split <strong>{total.toFixed(2)}%</strong></div>
      {error && <Alert>{error}</Alert>}{message && <Alert tone="success">{message}</Alert>}
      <Button fullWidth onClick={save} disabled={saving}><Save size={17}/>{saving ? 'Saving…' : 'Save common split'}</Button>
    </section>
  </>;
}
