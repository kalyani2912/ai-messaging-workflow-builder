import { useState } from 'react'
import { forgotPassword } from '../utils/userStore'

export default function ForgotPassword() {
  const [email, setEmail] = useState(''), [msg, setMsg] = useState('')
  const submit = async (e:any) => {
    e.preventDefault()
    const ok = await forgotPassword(email)
    setMsg(ok ? '✔️ Check your email' : '❌ Error sending reset link')
  }
  return (
    <form onSubmit={submit} className="p-6 max-w-md mx-auto">
      <h2>Forgot Password</h2>
      <input type="email" required placeholder="Your email"
        value={email} onChange={e=>setEmail(e.target.value)} />
      <button type="submit">Send reset link</button>
      <p>{msg}</p>
    </form>
  )
}
