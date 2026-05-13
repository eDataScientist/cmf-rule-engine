import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

function getOtpErrorMessage(rawMessage: string) {
  const message = rawMessage.toLowerCase();

  if (
    message.includes('signup') ||
    message.includes('not allowed') ||
    message.includes('user not found') ||
    message.includes('invalid login credentials')
  ) {
    return 'Access denied. Contact your administrator.';
  }

  return rawMessage;
}

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const { signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const normalizedEmail = email.trim().toLowerCase();
  const routeMessage = useMemo(() => {
    if (!location.state || typeof location.state !== 'object') {
      return null;
    }
    const maybeMessage = (location.state as { message?: unknown }).message;
    return typeof maybeMessage === 'string' ? maybeMessage : null;
  }, [location.state]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSendingCode(true);

    try {
      const { error: otpError } = await signInWithOtp(normalizedEmail);

      if (otpError) {
        setError(getOtpErrorMessage(otpError.message));
      } else {
        setCodeSent(true);
        setOtp('');
        setInfo(`Verification code sent to ${normalizedEmail}`);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setVerifyingOtp(true);

    try {
      const { error: otpError } = await verifyOtp(normalizedEmail, otp.trim());
      if (otpError) {
        setError(getOtpErrorMessage(otpError.message));
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Use the one-time code sent to your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={codeSent ? handleVerifyOtp : handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={codeSent}
              />
            </div>

            {codeSent && (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            )}

            {routeMessage && (
              <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{routeMessage}</div>
            )}

            {info && <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">{info}</div>}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {!codeSent ? (
              <Button type="submit" className="w-full" disabled={sendingCode || !normalizedEmail}>
                {sendingCode ? 'Sending code...' : 'Send code'}
              </Button>
            ) : (
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={verifyingOtp || otp.trim().length === 0}>
                  {verifyingOtp ? 'Verifying...' : 'Verify code'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={sendingCode}
                  onClick={async () => {
                    setError(null);
                    setInfo(null);
                    setSendingCode(true);

                    try {
                      const { error: otpError } = await signInWithOtp(normalizedEmail);
                      if (otpError) {
                        setError(getOtpErrorMessage(otpError.message));
                      } else {
                        setInfo(`New verification code sent to ${normalizedEmail}`);
                      }
                    } finally {
                      setSendingCode(false);
                    }
                  }}
                >
                  Resend code
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCodeSent(false);
                    setOtp('');
                    setError(null);
                    setInfo(null);
                  }}
                >
                  Use different email
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
