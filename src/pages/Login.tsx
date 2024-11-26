import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { useState } from 'react';

const loginSchema = z.object({
  loginId: z.string().min(1, 'ログインIDを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
});

const registerSchema = z.object({
  loginId: z.string().min(4, 'ログインIDは4文字以上である必要があります'),
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// Mock user data for demonstration
const MOCK_USERS = [
  { 
    id: '1', 
    loginId: 'kkkk1111',
    email: 'admin@example.com', 
    password: 'kkkk1111', 
    name: '鈴木 管理者', 
    role: 'admin',
    points: 0
  },
  { 
    id: '2', 
    loginId: 'kkkk2222',
    email: 'worker@example.com', 
    password: 'kkkk2222', 
    name: '山田 太郎', 
    role: 'worker',
    points: 0
  },
];

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginForm) => {
    try {
      const user = MOCK_USERS.find(
        (u) => u.loginId === data.loginId && u.password === data.password
      );

      if (!user) {
        throw new Error('ログインIDまたはパスワードが正しくありません');
      }

      const { password, ...userWithoutPassword } = user;
      login(userWithoutPassword);
      
      toast.success('ログインしました');
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ログインに失敗しました');
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      // In a real application, this would be an API call
      if (MOCK_USERS.some(u => u.loginId === data.loginId)) {
        throw new Error('このログインIDは既に使用されています');
      }
      if (MOCK_USERS.some(u => u.email === data.email)) {
        throw new Error('このメールアドレスは既に使用されています');
      }

      toast.success('アカウントを作成しました。ログインしてください。');
      setIsRegistering(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '登録に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <TrendingUp className="h-12 w-12 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          pointmoney
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ポイント管理システム
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!isRegistering ? (
            <form className="space-y-6" onSubmit={handleLoginSubmit(onLogin)}>
              <div>
                <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
                  ログインID
                </label>
                <div className="mt-1">
                  <input
                    id="loginId"
                    type="text"
                    {...loginRegister('loginId')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {loginErrors.loginId && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.loginId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    {...loginRegister('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {loginErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  ログイン
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  新規登録はこちら
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegisterSubmit(onRegister)}>
              <div>
                <label htmlFor="registerLoginId" className="block text-sm font-medium text-gray-700">
                  ログインID
                </label>
                <div className="mt-1">
                  <input
                    id="registerLoginId"
                    type="text"
                    {...registerRegister('loginId')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerErrors.loginId && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.loginId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  名前
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    {...registerRegister('name')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    {...registerRegister('email')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <div className="mt-1">
                  <input
                    id="registerPassword"
                    type="password"
                    {...registerRegister('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  パスワード（確認）
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    type="password"
                    {...registerRegister('confirmPassword')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  アカウントを作成
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  ログインに戻る
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}