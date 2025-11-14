import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '@/lib/API'

const ResetPassword = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        phone: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const errors = {};

        // Phone validation (Kenyan format)
        if (!form.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^(\+254|0)[17]\d{8}$/.test(form.phone.replace(/\s/g, ''))) {
            errors.phone = 'Please enter a valid Kenyan phone number';
        }

        // New password validation
        if (!form.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (form.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters long';
        } else if (form.newPassword.length > 12) {
            errors.newPassword = 'Password cannot exceed 12 characters';
        } else if (!/[A-Z]/.test(form.newPassword)) {
            errors.newPassword = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(form.newPassword)) {
            errors.newPassword = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(form.newPassword)) {
            errors.newPassword = 'Password must contain at least one number';
        } else if (!/[@$!%*?&.]/.test(form.newPassword)) {
            errors.newPassword = 'Password must contain at least one special character (@, $, !, %, *, ?, &, .)';
        }

        // Confirm password
        if (!form.confirmPassword) {
            errors.confirmPassword = 'Please confirm your new password';
        } else if (form.newPassword !== form.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target
        setForm(prev => ({...prev, [name]: value}))
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setFieldErrors({});
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            // Call reset password API
            const res = await resetPassword({
                phone: form.phone,
                newPassword: form.newPassword
            });

            // Show success message
            setMessage('Password reset successful! Redirecting to login...');

            // Reset form
            setForm({
                phone: '',
                newPassword: '',
                confirmPassword: ''
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Password reset error:', error.message);
            if (error.errors) {
                // Handle validation errors from backend
                const backendErrors = {};
                error.errors.forEach(err => {
                    if (err.path) {
                        backendErrors[err.path] = err.msg;
                    }
                });
                setFieldErrors(backendErrors);
            } else {
                setError(error.message || 'Password reset failed');
            }
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <i className="fas fa-key text-green-600 text-4xl"></i>
                </div>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                    Enter your registered phone number to create a new password
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                            {message}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className={fieldErrors.phone ? 'border-destructive' : ''}
                            placeholder="e.g., +254712345678 or 0712345678"
                            disabled={loading}
                        />
                        {fieldErrors.phone && (
                            <p className="text-sm text-red-600">{fieldErrors.phone}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-medium">New Password *</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={form.newPassword}
                                onChange={handleChange}
                                className={fieldErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                                placeholder="Create a strong password"
                                disabled={loading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {fieldErrors.newPassword && (
                            <p className="text-sm text-red-600">{fieldErrors.newPassword}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Password must be 8-12 characters with uppercase, lowercase, number, and special character.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password *</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className={fieldErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                                placeholder="Confirm your new password"
                                disabled={loading}
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
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {fieldErrors.confirmPassword && (
                            <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-700 hover:bg-green-800 text-white"
                        disabled={loading}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-muted-foreground">
                        Remember your password?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}

export default ResetPassword