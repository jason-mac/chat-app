import { useState } from 'react';
import { registerFetch } from '../services/auth';
import { loginFetch } from '../services/auth';
import type RegisterRequest from '../types/registerRequest';
import type LoginRequest from '../types/loginRequest';
import { useNavigate } from 'react-router-dom';

interface UsernameBoxProps {
  username: string;
  setUsername: (value: string) => void;
}

interface EmailBoxProps {
  email: string;
  setEmail: (value: string) => void;
}

interface PasswordBoxProps {
  password: string;
  setPassword: (value: string) => void;
}

const buttonStyling =
  'mt-2 py-3 bg-white text-black text-sm tracking-wide cursor-pointer';

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [registerPage, setRegisterPage] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const loginRequest: LoginRequest = {
        email: email,
        password: password,
      };

      const data = await loginFetch(loginRequest);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      navigate('/chat');
    } catch {
      setError('Could not connect to server');
    }
  };

  const handleRegister = async () => {
    try {
      const registerRequest: RegisterRequest = {
        email: email,
        username: username,
        password: password,
      };

      await registerFetch(registerRequest);
      setRegisterPage(false);
      setError('');
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration unsuccessful');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] font-mono">
      <div className="w-full max-w-sm p-10 bg-[#111] border border-[#222]">
        <h1 className="text-2xl font-normal text-white tracking-tight mb-1">
          {registerPage ? 'get started' : 'welcome back'}
        </h1>
        <p className="text-sm text-[#555] mb-9">
          {registerPage ? 'sign up to continue' : 'login to continue'}
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex flex-col gap-5">
          {registerPage && (
            <UsernameBox username={username} setUsername={setUsername} />
          )}
          <EmailBox email={email} setEmail={setEmail} />
          <PasswordBox password={password} setPassword={setPassword} />
          <button
            onClick={registerPage ? handleRegister : handleLogin}
            className={buttonStyling}
          >
            {registerPage ? 'Register' : 'Login'}
          </button>
        </div>

        <p className="text-xs text-[#555] mt-6 text-center">
          {registerPage ? 'return to' : 'no account?'}{' '}
          <button onClick={() => setRegisterPage(!registerPage)}>
            <p className="text-white cursor-pointer">
              {registerPage ? 'login' : 'register'}
            </p>
          </button>
        </p>
      </div>
    </div>
  );
}

const UsernameBox = ({ username, setUsername }: UsernameBoxProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#555] uppercase tracking-widest">
        username
      </label>
      <input
        type="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white text-sm font-mono outline-none"
        placeholder="username_example"
      />
    </div>
  );
};

const EmailBox = ({ email, setEmail }: EmailBoxProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#555] uppercase tracking-widest">
        email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white text-sm font-mono outline-none"
        placeholder="you@example.com"
      />
    </div>
  );
};

const PasswordBox = ({ password, setPassword }: PasswordBoxProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] text-[#555] uppercase tracking-widest">
        password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-3 py-2.5 bg-[#0a0a0a] border border-[#222] text-white text-sm font-mono outline-none"
        placeholder="••••••••"
      />
    </div>
  );
};

export default Home;
