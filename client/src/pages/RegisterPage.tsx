import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { registerRequest } from '../features/auth/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
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
      const { user, accessToken } = await registerRequest(values);
      dispatch(setCredentials({ user, accessToken }));
      navigate('/');
    } catch {
      setServerError('Could not register — email may already be in use');
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Create account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            placeholder="Name"
            {...register('name')}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
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
            placeholder="Password (min 8 chars)"
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
          {isSubmitting ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        Have an account?{' '}
        <Link to="/login" className="text-emerald-400 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
