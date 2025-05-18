import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../utils/userStore'

export default function ResetPassword() {
  const [search] = useSearchParams()
  const token = search.get('token')||''
  const [pw, setPw] = useState(''); const nav = useNavigate()
  const submit = async (e:any) => {
    e.preventDefault()
    const ok = await resetPassword(token, pw)
    if (ok) nav('/signin')
  }
  return (
    <form onSubmit={submit} className="p-6 max-w-md mx-auto">
      <h2>Reset Password</h2>
      <input type="password" required placeholder="New password"
        value={pw} onChange={e=>setPw(e.target.value)} />
      <button type="submit">Reset</button>
    </form>
  )
}
