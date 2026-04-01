import { UsernameBox } from '../components/home/UsernameBox';
import { useMemo, useState, useEffect } from 'react';
import { EmailBox } from '../components/home/EmailBox';
import { PasswordBox } from '../components/home/PasswordBox';
import { useAuth } from '../hooks/useAuth';

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') submitHandlers[pageType]();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submitHandlers, pageType]);

  const isRegister = pageType === 'register';

  return (
    <div
      className="min-h-screen flex items-center justify-center font-mono"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-sm p-10 bg-[#2b2d31]/90 backdrop-blur-sm rounded-lg shadow-2xl">
        <h1 className="text-2xl font-normal text-white tracking-tight mb-1">
          {isRegister ? 'get started' : 'welcome back'}
        </h1>
        <p className="text-sm text-[#80848e] mb-9">
          {isRegister ? 'sign up to continue' : 'login to continue'}
        </p>
        {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
        <div className="flex flex-col gap-5">
          {isRegister && (
            <UsernameBox username={username} setUsername={setUsername} />
          )}
          <EmailBox email={email} setEmail={setEmail} />
          <PasswordBox password={password} setPassword={setPassword} />
          <button
            onClick={submitHandlers[pageType]}
            className="w-full py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm font-semibold rounded transition-colors cursor-pointer"
          >
            {isRegister ? 'Register' : 'Login'}
          </button>
        </div>
        <p className="text-xs text-[#80848e] mt-6">
          {isRegister ? 'return to' : 'no account?'}{' '}
          <button
            onClick={() => setPageType(switchPage(pageType))}
            className="text-[#5865f2] hover:underline cursor-pointer"
          >
            {isRegister ? 'login' : 'register'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Home;
