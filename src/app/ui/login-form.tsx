'use client';

import { signIn, SignInResponse } from 'next-auth/react';
import { ChangeEvent, FormEvent, useState } from 'react';

export default function LoginForm() {

    // const LoginForm: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        const result: SignInResponse | undefined = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });
        alert(result?.status);
        if (result?.error) {
            // Handle error (e.g., show error message)
            alert('error');
        } else {
            // Handle success (e.g., redirect to dashboard)
            alert('success');
        }
        
    };
    return (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>
        </form>
      );
}