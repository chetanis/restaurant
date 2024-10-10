'use client'

import { signOut } from "next-auth/react"

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  return (
    <button onClick={handleLogout}>
      Log out
    </button>
  )
}