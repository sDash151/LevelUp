import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { useToast } from '@/design-system/components';
import { loginUser, signupUser, forgotPassword, getMe, logoutUser } from '../api';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const toast = useToast();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Login failed');
    },
  });
}

export function useSignup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const toast = useToast();

  return useMutation({
    mutationFn: signupUser,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.accessToken);
      toast.success('Account created!');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Signup failed');
    },
  });
}

export function useForgotPassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: (email) => forgotPassword(email),
    onSuccess: () => {
      toast.success('Check your email for reset instructions');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  return async () => {
    try { await logoutUser(); } catch {}
    logout();
    navigate('/login');
  };
}

export function useUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => getMe().then((r) => r.data.user),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}
