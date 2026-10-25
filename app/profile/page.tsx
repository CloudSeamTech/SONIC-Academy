'use client';
import { useEffect, useState } from 'react';
import { useAcademy } from '../academy-provider';
import { planLabel } from '../../lib/plan-access';
import { ConsoleReaderShell } from '../console-reader-shell';
export default function Profile() {
  const academy = useAcademy();
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setName(null); setEmail(null); setPhone(null); setNotice('');
  }, [academy.user?.id]);
  return (
    <ConsoleReaderShell>
      <main className="profile-page">
        <header className="profile-header">
          <span className="eyebrow">YOUR LEARNING SPACE</span>
          <h1>My profile</h1>
          <p>Your contact details, sign-in settings, subscription, and saved learning.</p>
        </header>
        <nav className="account-tabs" aria-label="Profile sections">
          <a href="#details">Personal details</a>
          <a href="#security">Sign-in & security</a>
          <a href="#membership">Subscription</a>
          <a href="#learning">Saved learning</a>
        </nav>
        {!academy.ready ? <p role="status">Loading your profile…</p> : <>
          {!academy.user && <section className="profile-signin-notice" aria-labelledby="profile-signin-title">
            <h2 id="profile-signin-title">You’re viewing your profile as a guest</h2>
            <p>{academy.accountAvailable
              ? 'Sign in to load your contact details and account progress. All profile settings are listed below.'
              : 'Public account sign-in is not connected yet. Your learning stays in this browser; contact details and account settings become available after sign-in is connected.'}</p>
            {academy.accountAvailable && <a className="primary-button" href="/signin-with-chatgpt?return_to=%2Fprofile" target="_top">Sign in with ChatGPT →</a>}
          </section>}
          <div className="profile-sections">
            <div className="profile-secondary">
              <section id="details" className="profile-section" aria-labelledby="profile-details-title">
                <h2 id="profile-details-title">Personal details</h2>
                {academy.user && <p>Signed in as <strong>{academy.user.name}</strong>. Your contact email is separate from your sign-in account.</p>}
                <form onSubmit={async (event) => {
                  event.preventDefault();
                  if (saving || !academy.user) return;
                  setSaving(true); setNotice('');
                  try {
                    await academy.saveProfile(name ?? academy.user.name, {
                      email: email ?? academy.user.email ?? '',
                      phone: phone ?? academy.user.phone ?? '',
                    });
                    setNotice('Your profile details are saved.');
                  } catch (error) { setNotice((error as Error).message); }
                  finally { setSaving(false); }
                }}>
                  <fieldset className="profile-fields" disabled={!academy.user || saving}>
                    <legend className="sr-only">Contact details</legend>
                    <label>Full name<input value={name ?? academy.user?.name ?? ''} placeholder={academy.user ? 'Your name' : 'Sign in to view your name'} required maxLength={80} autoComplete="name" onChange={(event) => setName(event.target.value)} /></label>
                    <label>Email address<input type="email" value={email ?? academy.user?.email ?? ''} placeholder={academy.user ? 'Your contact email' : 'Sign in to view your email'} maxLength={254} autoComplete="email" onChange={(event) => setEmail(event.target.value)} /></label>
                    <label>Phone number (optional)<input type="tel" value={phone ?? academy.user?.phone ?? ''} placeholder={academy.user ? 'Your phone number' : 'Sign in to add your phone'} maxLength={32} autoComplete="tel" onChange={(event) => setPhone(event.target.value)} /></label>
                    <button className="primary-button">{saving ? 'Saving…' : 'Save profile'}</button>
                  </fieldset>
                </form>
              </section>
              <section id="security" className="profile-section" aria-labelledby="profile-security-title">
                <h2 id="profile-security-title">Sign-in & security</h2>
                <h3>Password</h3>
                <p id="password-availability">{academy.user
                  ? 'This account signs in through ChatGPT. Manage its password with that provider; SONIC-Academy does not store it.'
                  : 'Password changes will be available when password-based accounts are connected. Google and GitHub sign-ins use the password managed by that provider.'}</p>
                <button type="button" disabled aria-describedby="password-availability">Change password</button>
                <h3>Connected sign-in accounts</h3>
                <dl className="profile-provider-list">
                  <div><dt>Google / Gmail</dt><dd>Not connected</dd></div>
                  <div><dt>GitHub</dt><dd>Not connected</dd></div>
                  {academy.user && <div><dt>ChatGPT</dt><dd>Current sign-in provider</dd></div>}
                  <div><dt>Organization SSO</dt><dd>Not configured</dd></div>
                </dl>
                <p>Google and GitHub sign-in, account linking, and organization SSO are not enabled on this website yet.</p>
                {academy.user && <a href="/signout-with-chatgpt?return_to=%2F" target="_top">Sign out →</a>}
              </section>
            </div>
            <div className="profile-secondary">
              <section id="membership" className="profile-section account-subscription" aria-labelledby="profile-plan-title">
                <h2 id="profile-plan-title">Subscription</h2>
                <p>{academy.user ? <>Current plan: <strong>{planLabel(academy.user.subscriptionTier)}</strong></> : 'Sign in to view your account’s membership.'}</p>
                <p>Free Tier · Apex Tier</p>
                <p id="billing-availability">Billing is not connected. You can compare plans, but this website cannot take payments, upgrade a subscription, or process cancellations yet.</p>
                <div className="profile-actions">
                  <a className="primary-button" href="/plans" aria-describedby="billing-availability">Upgrade to Apex — view plans</a>
                  <button type="button" disabled aria-describedby="billing-availability">Cancel subscription</button>
                </div>
                <p><a href="/support#billing">Billing & cancellation information →</a></p>
              </section>
              <section id="learning" className="profile-section" aria-labelledby="profile-learning-title">
                <h2 id="profile-learning-title">Saved learning</h2>
                <dl className="profile-learning-stats">
                  <div><dt>Completed labs</dt><dd>{academy.completed.length}</dd></div>
                  <div><dt>Bookmarked labs</dt><dd>{academy.bookmarks.length}</dd></div>
                </dl>
                <a href="/?view=bookmarks">Open my bookmarks →</a>
                <p><a href="/dmz#lesson=dmz-plan">Open my DMZ lab notebook →</a></p>
                {academy.user ? <>
                  <p>Started as a guest? Import this browser’s earlier progress only if it belongs to you.</p>
                  <button type="button" disabled={saving} onClick={async () => {
                    setSaving(true);
                    try { await academy.importGuest(); setNotice('Your guest progress has been imported.'); }
                    catch (error) { setNotice((error as Error).message); }
                    finally { setSaving(false); }
                  }}>Import my browser progress</button>
                </> : <p>Guest progress stays in this browser. Clearing browser data can remove it.</p>}
              </section>
              <section className="profile-section"><h2>Need help?</h2><a href="/support#faq">Account help & FAQ →</a></section>
            </div>
          </div>
        </>}
        {notice && <p role="status" aria-live="polite">{notice}</p>}
        {academy.user && academy.syncMessage && <p role="status">{academy.syncMessage}</p>}
      </main>
    </ConsoleReaderShell>
  );
}
