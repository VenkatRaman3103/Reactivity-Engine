import { email, password, isValid, submitStatus, submit } from './login.form'

export default function LoginForm() {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h3 style={{ marginTop: 0, color: '#333' }}>Login Form Demo</h3>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Email</label>
        <input
          bind:value={email.value}
          style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box;"
          placeholder="Enter email..."
        />
        {() => email.error && (
          <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
            {email.error}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#444' }}>Password</label>
        <input
          type="password"
          bind:value={password.value}
          onBlur={() => password.touch()}
          style="width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box;"
          placeholder="Min 8 characters..."
        />
        {() => password.error && (
          <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
            {password.error}
          </div>
        )}
      </div>

      <button
        onClick={submit}
        disabled={() => !isValid}
      >
        Submit
      </button>

      {() => submitStatus && (
        <div style={{ marginTop: '16px', textAlign: 'center', color: submitStatus.includes('Error') ? 'red' : 'green', fontWeight: 500 }}>
          {submitStatus}
        </div>
      )}
    </div>
  )
}
