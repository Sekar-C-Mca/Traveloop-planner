'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Compass, EnvelopeSimple, LockKey, Globe } from '@phosphor-icons/react';
import { UnderlineInput } from '@/components/ui/underline-input';
import { TraveloopButton } from '@/components/ui/traveloop-button';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import type { AuthResponse } from '@/types';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const TRAVEL_IMAGES = [
  'https://images.unsplash.com/photo-1506929562872-b034d5099b21?w=400',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae598?w=400',
  'https://images.unsplash.com/photo-1530789253388-582c4ef3842b?w=400',
  'https://images.unsplash.com/photo-1507525428034-b723cf961883?w=400',
  'https://images.unsplash.com/photo-1520250493593-399114814022?w=400',
  'https://images.unsplash.com/photo-1500530855697-589ab5bec6d5?w=400',
];

const IMAGE_ROTATIONS = [-2, 1.5, -1, 2, -1.5, 1];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AuthResponse>('/api/auth/login', data);
      const { token, user } = response.data;
      setAuth(user, token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image mosaic */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-charcoal-900">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-3 p-8">
          {TRAVEL_IMAGES.map((src, i) => (
            <motion.div
              key={i}
              className="relative overflow-hidden rounded-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{ transform: `rotate(${IMAGE_ROTATIONS[i]}deg)` }}
            >
              <img
                src={src}
                alt={`Travel destination ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/30 to-charcoal-900/50" />

        {/* Quote */}
        <div className="absolute inset-0 flex items-end justify-center pb-16 px-12">
          <motion.blockquote
            className="text-white font-display text-2xl leading-relaxed text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            &ldquo;Travel is the only thing you buy that makes you richer.&rdquo;
          </motion.blockquote>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 bg-cream flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <Compass size={40} className="text-ember-500" weight="fill" />
            <span className="font-display text-3xl text-charcoal-900">
              Traveloop
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-2xl text-charcoal-900 text-center mb-8">
            Welcome back
          </h1>

          {/* Error display */}
          {error && (
            <motion.div
              className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <EnvelopeSimple
                size={18}
                className="absolute left-0 top-[38px] text-charcoal-400"
              />
              <UnderlineInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                register={register('email')}
                error={errors.email?.message}
                className="pl-6"
              />
            </div>

            <div className="relative">
              <LockKey
                size={18}
                className="absolute left-0 top-[38px] text-charcoal-400"
              />
              <UnderlineInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                register={register('password')}
                error={errors.password?.message}
                className="pl-6"
              />
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-ember-500 hover:text-ember-600 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit button */}
            <TraveloopButton
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In
            </TraveloopButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-charcoal-200" />
            <span className="text-xs text-charcoal-400 uppercase">or</span>
            <div className="flex-1 h-px bg-charcoal-200" />
          </div>

          {/* Google button */}
          <TraveloopButton
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            leftIcon={<Globe size={20} />}
          >
            Continue with Google
          </TraveloopButton>

          {/* Sign up link */}
          <p className="text-center text-sm text-charcoal-500 mt-8">
            Don&apos;t have an account?{' '}
            <a
              href="/signup"
              className={cn(
                'text-ember-500 font-medium hover:text-ember-600 transition-colors'
              )}
            >
              Sign up
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
