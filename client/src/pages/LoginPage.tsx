import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { loginRequest } from '../features/auth/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function onSubmit(values: FormValues) {
    setServerError('');
    try {
      const { user, accessToken } = await loginRequest(values);
      dispatch(setCredentials({ user, accessToken }));
      navigate('/');
    } catch {
      setServerError('Invalid email or password');
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            {...register('password')}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>
        {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        No account?{' '}
        <Link to="/register" className="text-emerald-400 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
