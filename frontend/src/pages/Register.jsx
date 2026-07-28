import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

// Custom Animated Counter Component
const AnimatedCounter = ({ endValue, duration = 1500, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(endValue, 10);
    if (isNaN(end)) return;
    if (start === end) return;

    const totalMilliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMilliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [endValue, duration]);

  return <span>{count}{suffix}</span>;
};

// Custom Animated Particles
const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {[...Array(20)].map((_, i) => {
        const size = Math.random() * 6 + 2;
        const delay = Math.random() * 5;
        const left = Math.random() * 100;
        const duration = Math.random() * 6 + 6;
        return (
          <div
            key={i}
            className="absolute bg-emerald-400/20 rounded-full particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              bottom: `-20px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
};

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

// Microsoft Icon Component
const MicrosoftIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 23 23" fill="currentColor">
    <rect x="0" y="0" width="11" height="11" fill="#f25022"/>
    <rect x="12" y="0" width="11" height="11" fill="#7fba00"/>
    <rect x="0" y="12" width="11" height="11" fill="#00a4ef"/>
    <rect x="12" y="12" width="11" height="11" fill="#ffb900"/>
  </svg>
);

// Custom Floating Input Component
const FloatingInput = React.forwardRef(({ label, type, id, error, togglePassword, showPassword, ...props }, ref) => {
  return (
    <div className="relative w-full mb-4 group">
      <input
        type={type}
        id={id}
        ref={ref}
        placeholder=" "
        className={`block py-3 px-4 w-full text-sm text-white bg-white/5 border rounded-xl appearance-none focus:outline-none focus:ring-1 focus:ring-[#81C784] focus:border-[#81C784] peer transition-all ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-white/10 hover:border-white/20'
        }`}
        {...props}
      />
      <label
        htmlFor={id}
        className="absolute text-xs sm:text-sm text-slate-300 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#111e15] sm:bg-transparent px-2 peer-focus:px-2 peer-focus:text-[#81C784] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:text-slate-400 peer-focus:scale-75 peer-focus:-translate-y-4 left-3 cursor-text"
      >
        {label}
      </label>
      {togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
});

export default function Register() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleName: 'Sustainability Manager',
      organizationName: '',
      contactDetails: '',
      agreeTerms: false
    }
  });

  const selectedRole = watch('roleName');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!data.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      await authRegister(
        data.email,
        data.fullName,
        data.password,
        data.roleName,
        data.organizationName,
        data.contactDetails
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Registration failed. Check network or try another email.');
    } finally {
      setLoading(false);
    }
  };

  const styleBlock = `
    @keyframes float {
      0% { transform: translateY(0px) translateX(0px); opacity: 0; }
      50% { opacity: 0.3; }
      100% { transform: translateY(-120px) translateX(20px); opacity: 0; }
    }
    .particle {
      animation: float 8s ease-in-out infinite;
    }
  `;

  return (
    <div className="h-screen max-h-screen w-full relative flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-12 overflow-hidden font-poppins text-white select-none">
      <style>{styleBlock}</style>
      
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 bg-cover bg-center -z-20 transition-all duration-300"
        style={{ backgroundImage: "url('/hero_bg.png')" }}
      ></div>

      {/* Dark green overlay (60-70% opacity) */}
      <div className="absolute inset-0 bg-[#064E3B]/65 -z-10"></div>
      
      {/* Subtle green-to-black gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-black/80 -z-10"></div>

      <ParticleBackground />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 lg:-translate-y-4">
        
        {/* Left Column (60% / col-span-7) */}
        <div className="lg:col-span-7 flex flex-col justify-center text-white space-y-6 lg:space-y-8 py-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors self-start mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/20 backdrop-blur-md rounded-2xl border border-emerald-500/30">
              <Leaf size={28} className="text-[#81C784] animate-pulse" />
            </div>
            <span className="text-2xl font-bold tracking-wider uppercase text-white">
              Weave<span className="text-[#81C784] font-black">Cycle</span>
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Transforming Textile Waste <br className="hidden sm:inline" />
              Into A <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81C784] to-[#43A047]">Circular Future</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-200 font-medium max-w-xl leading-relaxed">
              Harness the power of Artificial Intelligence and Computer Vision to identify textile materials, classify waste, estimate recyclability, and accelerate sustainable resource recovery.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col justify-between">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#81C784]">
                <AnimatedCounter endValue="92" suffix="M Tons" />
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">Textile waste generated globally every year</p>
            </div>
            
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col justify-between">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#81C784]">
                <AnimatedCounter endValue="12" suffix="%" />
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">Textile waste currently recycled</p>
            </div>

            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col justify-between">
              <p className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Powered
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">Intelligent recognition & classification</p>
            </div>

            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex flex-col justify-between">
              <p className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                Circular Loop
              </p>
              <p className="text-xs text-slate-300 font-medium mt-1">Accelerating sustainable loop cycles</p>
            </div>
          </div>
        </div>

        {/* Right Column (40% / col-span-5) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end py-6 w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[460px] p-7 bg-white/10 border border-white/10 rounded-[24px] shadow-glass backdrop-blur-[20px] text-white flex flex-col"
          >
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">Create corporate profile</h2>
              <p className="text-xs text-slate-300 mt-1">Join the Weave Cycle supply-chain circle</p>
            </div>

            {success ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-2xl text-center flex flex-col items-center space-y-4 animate-fade-in my-auto">
                <CheckCircle size={48} className="text-emerald-400" />
                <h3 className="text-base font-bold">Profile Registered Successfully!</h3>
                <p className="text-xs text-slate-200">Your circular profile is activated. Redirecting you to login portal...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-start space-x-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FloatingInput
                      label="Full Name"
                      type="text"
                      id="register-fullname"
                      error={errors.fullName}
                      {...register('fullName', { required: 'Name is required' })}
                    />

                    <FloatingInput
                      label="Email Address"
                      type="email"
                      id="register-email"
                      error={errors.email}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FloatingInput
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="register-password"
                      error={errors.password}
                      togglePassword={() => setShowPassword(!showPassword)}
                      showPassword={showPassword}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                      })}
                    />

                    <FloatingInput
                      label="Confirm Password"
                      type="password"
                      id="register-confirm-password"
                      error={errors.confirmPassword}
                      {...register('confirmPassword', { required: 'Password confirmation is required' })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative w-full mb-4">
                      <select
                        id="register-role"
                        className="w-full px-3 py-3.5 bg-white/5 border border-white/10 rounded-xl outline-none text-xs text-white focus:ring-1 focus:ring-[#81C784] focus:border-[#81C784] hover:border-white/20 transition-all appearance-none"
                        {...register('roleName')}
                      >
                        <option className="bg-[#111e15] text-white" value="Sustainability Manager">Sustainability Manager</option>
                        <option className="bg-[#111e15] text-white" value="Recycling Facility Operator">Recycling Operator</option>
                        <option className="bg-[#111e15] text-white" value="Textile Manufacturer">Textile Manufacturer</option>
                        <option className="bg-[#111e15] text-white" value="Administrator">Administrator</option>
                      </select>
                      <label className="absolute text-[10px] text-[#81C784] -translate-y-3.5 scale-75 top-2 z-10 origin-[0] px-2 left-3 bg-[#111e15] sm:bg-transparent">
                        Account Role
                      </label>
                    </div>

                    <FloatingInput
                      label="Contact Number"
                      type="text"
                      id="register-contact"
                      error={errors.contactDetails}
                      {...register('contactDetails')}
                    />
                  </div>

                  {/* Conditional Organization Name */}
                  {['Recycling Facility Operator', 'Textile Manufacturer', 'Sustainability Manager'].includes(selectedRole) && (
                    <div className="w-full">
                      <FloatingInput
                        label="Company / Organization Name"
                        type="text"
                        id="register-org"
                        error={errors.organizationName}
                        {...register('organizationName', {
                          required: {
                            value: true,
                            message: 'Organization name is required for operations tracking'
                          }
                        })}
                      />
                    </div>
                  )}

                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start text-xs pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        className="w-4 h-4 rounded border-white/15 bg-white/5 text-[#2E7D32] focus:ring-[#2E7D32]"
                        {...register('agreeTerms', { required: true })}
                      />
                      <span className="text-[11px] text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                        I agree to the <a href="#" className="font-bold text-[#81C784] hover:underline">Terms & Conditions</a>
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    id="register-submit-btn"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#2E7D32] to-[#43A047] hover:shadow-[0_0_20px_rgba(67,160,71,0.4)] disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.99]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Registering Account...
                      </span>
                    ) : 'Create Account'}
                  </button>
                </form>

                {/* Social dividers */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-x-0 border-t border-white/10"></div>
                  <span className="relative px-3 bg-transparent text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    or sign up with
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button 
                    onClick={() => alert("Google Single Sign-Up activated.")}
                    className="flex items-center justify-center py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-xs font-semibold"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button 
                    onClick={() => alert("Microsoft Single Sign-Up activated.")}
                    className="flex items-center justify-center py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-xs font-semibold"
                  >
                    <MicrosoftIcon />
                    Microsoft
                  </button>
                </div>

                <div className="mt-auto text-center text-xs text-slate-300">
                  Already registered?{' '}
                  <Link to="/login" id="register-login-link" className="font-bold text-[#81C784] hover:underline">
                    Sign In instead
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>

      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-6 text-xs text-slate-300 z-10 w-full px-6">
        <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
        <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
        <a className="hover:text-white transition-colors" href="#">Contact</a>
        <span>Version 1.0.0</span>
      </footer>
    </div>
  );
}
