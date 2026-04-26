/**
 * example/BindingDemo.tsx
 *
 * Live demo of all bind:* directives:
 *   bind:value   — text / email / tel / textarea
 *   bind:checked — checkbox
 *   bind:value   — select
 *   bind:group   — radio group
 */
import {
  firstName, lastName, email, phone,
  role, newsletter, bio, agreeTerms,
  loading, submitted, error,
  submitForm, resetForm,
  setFirstName, setLastName, setEmail, setPhone,
  setRole, setNewsletter, setBio, setAgreeTerms
} from './contact.state'

// ─── tiny utility styles ──────────────────────────────────────────────────────

const S = {
  wrap: {
    fontFamily: "'Inter', system-ui, sans-serif",
    maxWidth: '680px',
    margin: '0 auto',
    padding: '0 0 60px',
  },
  hero: {
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
    borderRadius: '24px',
    padding: '40px',
    marginBottom: '32px',
    border: '1px solid rgba(126,200,227,0.15)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(126,200,227,0.15)',
    color: '#7ec8e3',
    fontSize: '10px',
    fontWeight: '900',
    letterSpacing: '1.5px',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '16px',
    border: '1px solid rgba(126,200,227,0.3)',
  },
  heading: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  subheading: {
    margin: '0',
    fontSize: '14px',
    color: '#888',
    lineHeight: '1.6',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '16px',
    border: '1px solid #eee',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    margin: '0 0 20px',
    fontSize: '13px',
    fontWeight: '900',
    color: '#999',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#555',
    letterSpacing: '0.3px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e5e5',
    fontSize: '14px',
    color: '#111',
    outline: 'none',
    transition: 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box' as const,
    background: '#fafafa',
  },
  select: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e5e5',
    fontSize: '14px',
    color: '#111',
    outline: 'none',
    background: '#fafafa',
    width: '100%',
    cursor: 'pointer',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e5e5',
    fontSize: '14px',
    color: '#111',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '90px',
    width: '100%',
    boxSizing: 'border-box' as const,
    background: '#fafafa',
    fontFamily: 'inherit',
  },
  radioGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e5e5e5',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#444',
    transition: 'all 0.15s',
    userSelect: 'none' as const,
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
  },
  previewBox: {
    background: '#0f0f0f',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '20px',
    border: '1px solid #1e1e1e',
  },
  previewTitle: {
    fontSize: '9px',
    fontWeight: '900',
    color: '#444',
    letterSpacing: '1px',
    marginBottom: '12px',
    textTransform: 'uppercase' as const,
  },
  previewRow: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px',
    marginBottom: '6px',
    alignItems: 'baseline',
  },
  previewKey: {
    color: '#7ec8e3',
    fontWeight: '700',
    minWidth: '100px',
    fontFamily: 'monospace',
  },
  previewVal: {
    color: '#eee',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #4eca8b, #29b574)',
    color: '#fff',
    border: 'none',
    padding: '13px 28px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  resetBtn: {
    background: 'transparent',
    color: '#888',
    border: '1.5px solid #e5e5e5',
    padding: '13px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  errorBox: {
    background: 'rgba(255,95,86,0.08)',
    border: '1px solid rgba(255,95,86,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#ff5f56',
    fontSize: '13px',
    marginBottom: '16px',
  },
  successBox: {
    background: 'rgba(78,202,139,0.08)',
    border: '1px solid rgba(78,202,139,0.3)',
    borderRadius: '10px',
    padding: '20px',
    color: '#4eca8b',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  codePill: {
    display: 'inline-block',
    background: 'rgba(126,200,227,0.1)',
    color: '#7ec8e3',
    fontFamily: 'monospace',
    fontSize: '11px',
    padding: '2px 7px',
    borderRadius: '4px',
    border: '1px solid rgba(126,200,227,0.2)',
  },
}

const ROLES = ['user', 'admin', 'editor', 'guest']

export default function BindingDemo() {
  return (
    <div style={S.wrap}>

      {/* ── Hero ── */}
      <div style={S.hero}>
        <div style={S.badge}>COMPILER FEATURE</div>
        <h2 style={S.heading}>Two-Way Binding</h2>
        <p style={S.subheading}>
          Write <code style={{ color: '#7ec8e3', fontFamily: 'monospace' }}>bind:value=&#123;state&#125;</code> and
          the compiler expands it into the correct value + event handler pair — automatically.
          Every field below uses a <span style={S.codePill}>bind:*</span> directive.
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={submitForm}>

        {submitted && (
          <div style={S.successBox}>
            ✅ Form submitted successfully! &nbsp;
            <button type="button" style={{ ...S.resetBtn, display: 'inline-block', padding: '6px 14px', fontSize: '12px' }} onClick={resetForm}>
              Reset
            </button>
          </div>
        )}

        {error && <div style={S.errorBox}>⚠ {error}</div>}

        {/* ── Text inputs ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <span style={S.codePill}>bind:value</span> Text Inputs
          </div>
          <div style={S.row}>
            <div style={S.fieldWrap}>
              <label style={S.label}>First Name *</label>
              <input
                id="bind-first-name"
                type="text"
                placeholder="Ada"
                style={S.input}
                bind:value={firstName}
              />
            </div>
            <div style={S.fieldWrap}>
              <label style={S.label}>Last Name *</label>
              <input
                id="bind-last-name"
                type="text"
                placeholder="Lovelace"
                style={S.input}
                bind:value={lastName}
              />
            </div>
          </div>
          <div style={S.row}>
            <div style={S.fieldWrap}>
              <label style={S.label}>Email *</label>
              <input
                id="bind-email"
                type="email"
                placeholder="ada@engine.dev"
                style={S.input}
                bind:value={email}
              />
            </div>
            <div style={S.fieldWrap}>
              <label style={S.label}>Phone</label>
              <input
                id="bind-phone"
                type="tel"
                placeholder="+1 555 0100"
                style={S.input}
                bind:value={phone}
              />
            </div>
          </div>
        </div>

        {/* ── Select ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <span style={S.codePill}>bind:value</span> Select
          </div>
          <div style={S.fieldWrap}>
            <label style={S.label}>Role</label>
            <select id="bind-role" style={S.select} bind:value={role}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>

        {/* ── Radio group ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <span style={S.codePill}>bind:group</span> Radio Group
          </div>
          <div style={S.radioGroup}>
            {ROLES.map(r => (
              <label
                key={r}
                style={{
                  ...S.radioLabel,
                  borderColor: role === r ? '#7ec8e3' : '#e5e5e5',
                  background:  role === r ? 'rgba(126,200,227,0.08)' : 'transparent',
                  color:       role === r ? '#111' : '#666',
                }}
              >
                <input
                  type="radio"
                  bind:group={role}
                  value={r}
                  style={{ accentColor: '#7ec8e3' }}
                />
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </label>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#aaa' }}>
            Select and radio are synced — both control the same <span style={S.codePill}>role</span> state.
          </p>
        </div>

        {/* ── Textarea ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <span style={S.codePill}>bind:value</span> Textarea
          </div>
          <div style={S.fieldWrap}>
            <label style={S.label}>Bio</label>
            <textarea
              id="bind-bio"
              placeholder="Tell us about yourself…"
              style={S.textarea}
              bind:value={bio}
            />
          </div>
        </div>

        {/* ── Checkboxes ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <span style={S.codePill}>bind:checked</span> Checkboxes
          </div>
          <div style={S.checkRow}>
            <input
              id="bind-newsletter"
              type="checkbox"
              style={{ accentColor: '#7ec8e3', width: '16px', height: '16px', cursor: 'pointer' }}
              bind:checked={newsletter}
            />
            <label for="bind-newsletter" style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
              Subscribe to newsletter
            </label>
          </div>
          <div style={S.checkRow}>
            <input
              id="bind-terms"
              type="checkbox"
              style={{ accentColor: '#7ec8e3', width: '16px', height: '16px', cursor: 'pointer' }}
              bind:checked={agreeTerms}
            />
            <label for="bind-terms" style={{ fontSize: '14px', color: '#333', cursor: 'pointer' }}>
              I agree to the terms and conditions *
            </label>
          </div>
        </div>

        {/* ── Live State Preview ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Live State Preview</div>
          <div style={S.previewBox}>
            <div style={S.previewTitle}>contact.state.ts</div>
            {[
              ['firstName',  firstName],
              ['lastName',   lastName],
              ['email',      email],
              ['phone',      phone],
              ['role',       role],
              ['bio',        bio],
              ['newsletter', newsletter],
              ['agreeTerms', agreeTerms],
            ].map(([k, v]) => (
              <div style={S.previewRow}>
                <span style={S.previewKey}>{String(k)}</span>
                <span style={S.previewVal}>{JSON.stringify(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            id="bind-reset"
            type="button"
            style={S.resetBtn}
            onClick={resetForm}
          >
            Reset
          </button>
          <button
            id="bind-submit"
            type="submit"
            style={{ ...S.submitBtn, opacity: loading ? 0.6 : 1 }}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Submit Form'}
          </button>
        </div>

      </form>
    </div>
  )
}
