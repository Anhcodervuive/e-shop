export const AUTH_CACHE_TTL = {
  OTP: 5 * 60,
  OTP_COOLDOWN: 60,
  OTP_REQUEST_WINDOW: 60 * 60,
  OTP_LOCK: 30 * 60,
  PENDING_USER: 5 * 60,
} as const;

export const AUTH_LIMITS = {
  MAX_OTP_REQUESTS_PER_WINDOW: 2,
  MAX_OTP_ATTEMPTS: 5,
  OTP_DIGITS: 6,
  BCRYPT_SALT_ROUNDS: 10,
} as const;

export const AUTH_REDIS_KEYS = {
  otp: (email: string) => `otp:${email}`,
  otpCooldown: (email: string) => `otp_cooldown:${email}`,
  otpRequestCount: (email: string) => `otp_request_count:${email}`,
  otpLock: (email: string) => `otp_lock:${email}`,
  otpSpamLock: (email: string) => `otp_spam_lock:${email}`,
  otpAttempts: (email: string) => `otp_attempts:${email}`,
  pendingUser: (email: string) => `pending-user:${email}`,
} as const;

export const AUTH_MESSAGES = {
  emailInUse: 'Email already in use',
  otpExpired: 'OTP expired or not found. Please request a new OTP.',
  otpInvalid: 'Invalid OTP',
  otpTooManyRequests: 'Too many OTP requests. Please try again later.',
  otpCooldown: 'OTP request cooldown active. Please wait before requesting another OTP.',
  otpLocked: 'Account locked due to multiple failed OTP attempts. Please try again later.',
  pendingUserMissing: 'No pending registration found for this email. Please register again.',
  registerSuccess: 'Registration successful. Please check your email for the OTP to activate your account.',
  verifySuccess: 'User verified successfully.',
} as const;
