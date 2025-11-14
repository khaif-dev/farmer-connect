import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, UsersRound } from 'lucide-react';
import { createUser } from '@/lib/API';

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'farmer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    // First name validation
    if (!form.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (form.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!form.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (form.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation (optional but if provided, must be valid)
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Please provide a valid email address';
    }

    // Phone validation (Kenyan format)
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+254|0)[17]\d{8}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid Kenyan phone number';
    }

    // Password validation
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (form.password.length > 12) {
      errors.password = 'Password cannot exceed 12 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(form.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(form.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[@$!%*?&.]/.test(form.password)) {
      errors.password = 'Password must contain at least one special character (@, $, !, %, *, ?, &, .)';
    }

    // Confirm password
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password.trim() !== form.confirmPassword.trim()) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const result = await register(form);

      if (result.success) {
        navigate('/onboarding');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      if (err.message.includes('already exists')) {
        setError('A user with the same phone number or email already exists.');
      } else {
        setError('Network error. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full shadow-2xl border-0 bg-green-50 dark:bg-gray-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center">
            <UsersRound className="w-8 h-8 text-white"/>
          </div>
          <CardTitle className="text-3xl font-bold bg-green-700 dark:bg-green-500 bg-clip-text text-transparent">
            Join Farmer Connect
          </CardTitle>
          <p className="text-muted-foreground dark:text-gray-400 mt-2 text-lg">Create your account to get started</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 dark:bg-red-900/20 border border-destructive/20 dark:border-red-800 text-destructive dark:text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${fieldErrors.firstName ? 'border-red-500 dark:border-red-600' : ''}`}
                  placeholder="Enter first name"
                />
                {fieldErrors.firstName && (
                  <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${fieldErrors.lastName ? 'border-red-500 dark:border-red-600' : ''}`}
                  placeholder="Enter last name"
                />
                {fieldErrors.lastName && (
                  <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${fieldErrors.email ? 'border-red-500 dark:border-red-600' : ''}`}
                  placeholder="Enter email address"
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${fieldErrors.phone ? 'border-red-500 dark:border-red-600' : ''}`}
                  placeholder="e.g., +254712345678 or 0712345678"
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10 ${fieldErrors.password ? 'border-red-500 dark:border-red-600' : ''}`}
                  placeholder="Create a strong password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </Button>
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be 8-12 characters with uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 dark:border-red-600' : ''}`}
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </Button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            </div>

            

            <div className="space-y-2">
              <Label htmlFor="userType" className="text-sm font-medium text-gray-700 dark:text-gray-300">I am a *</Label>
              <Select value={form.userType} onValueChange={(value) => setForm(prev => ({ ...prev, userType: value }))}>
                <SelectTrigger className={`border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${fieldErrors.userType ? 'border-red-500 dark:border-red-600' : ''}`}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectItem value="farmer" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Farmer</SelectItem>
                  <SelectItem value="buyer" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600">Buyer</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.userType && (
                <p className="text-sm text-red-600 dark:text-red-400">{fieldErrors.userType}</p>
              )}
            </div>

            
            <Button type="submit" className="w-full py-6 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white font-semibold text-lg transition-all duration-200 transform hover:-translate-y-0.5"
             disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
                Log in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;