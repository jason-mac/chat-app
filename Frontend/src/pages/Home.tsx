import { UsernameBox } from '../components/home/UsernameBox';
import { useMemo } from 'react';
import { EmailBox } from '../components/home/EmailBox';
import { PasswordBox } from '../components/home/PasswordBox';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

type PageType = 'register' | 'login';

type PageHandlers = Record<PageType, () => Promise<void>>;

const switchPage = (pageType: PageType): PageType => {
  switch (pageType) {
    case 'register':
      return 'login';
    case 'login':
      return 'register';
  }
};

const buttonStyling =
  'mt-2 py-3 bg-white text-black text-sm tracking-wide cursor-pointer';

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [pageType, setPageType] = useState<PageType>('login');
  const { login, register } = useAuth();

  const resetForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  const submitHandlers: PageHandlers = useMemo(
    () => ({
      login: async () => {
        try {
          await login({ email, password });
        } catch {
          setError('Could not connect to server');
        }
      },
      register: async () => {
        try {
          await register({ email, username, password });
          setPageType('login');
          resetForm();
        } catch (e) {
          setError(
            e instanceof Error ? e.message : 'Registration unsuccessful'
          );
        }
      },
    }),
    [email, password, username]
  );

  const isRegister = pageType === 'register';
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] font-mono">
      <div className="w-full max-w-sm p-10 bg-[#111] border border-[#222]">
        <h1 className="text-2xl font-normal text-white tracking-tight mb-1">
          {isRegister ? 'get started' : 'welcome back'}
        </h1>
        <p className="text-sm text-[#555] mb-9">
          {isRegister ? 'sign up to continue' : 'login to continue'}
        </p>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex flex-col gap-5">
          {isRegister && (
            <UsernameBox username={username} setUsername={setUsername} />
          )}
          <EmailBox email={email} setEmail={setEmail} />
          <PasswordBox password={password} setPassword={setPassword} />
          <button onClick={submitHandlers[pageType]} className={buttonStyling}>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </div>
        <p className="text-xs text-[#555] mt-6 text-center">
          {isRegister ? 'return to' : 'no account?'}{' '}
          <button
            onClick={() => setPageType(switchPage(pageType))}
            className="text-white cursor-pointer"
          >
            {isRegister ? 'login' : 'register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Home;
