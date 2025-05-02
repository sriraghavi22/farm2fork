import React, { useState } from 'react';
import api from "./api"; // ✅ Import Axios instance
import { useNavigate } from "react-router-dom";
import { 
  Sprout, Mail, Lock, Phone, User, MapPin, Building2, 
  Store, Tractor, Truck, ChevronRight, ArrowLeft,
  CheckCircle2, Loader2, Eye, EyeOff
} from 'lucide-react';

type UserRole = 'farmer' | 'distributor' | 'shopkeeper';
type AuthPage = 'login' | 'signup';
type SignupStep = 'role' | 'details' | 'otp' | 'password';
interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgImage: string;
}

interface BusinessFormData {
  name: string;
  businessName: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}
interface ShopFormData {
  name: string;
  shopName: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

function LoginSignup() {
  const navigate = useNavigate();
  const [authPage, setAuthPage] = useState<AuthPage>('login');
  const [currentStep, setCurrentStep] = useState<SignupStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [businessFormData, setBusinessFormData] = useState<BusinessFormData>({
    name: '',
    businessName: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [shopFormData, setshopFormData] = useState<ShopFormData>({
    name: '',
    shopName: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false); // ✅ New state for signup success

  const roleOptions: RoleOption[] = [
    {
      id: 'farmer',
      title: 'Farmer',
      description: 'Connect directly with distributors and sell your produce at better prices',
      icon: <Tractor className="h-8 w-8" />,
      bgImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070'
    },
    {
      id: 'distributor',
      title: 'Distributor',
      description: 'Bridge the gap between farmers and shopkeepers efficiently',
      icon: <Truck className="h-8 w-8" />,
      bgImage: 'https://images.unsplash.com/photo-1595246140962-93180ddb4e47?q=80&w=2070'
    },
    {
      id: 'shopkeeper',
      title: 'Shopkeeper',
      description: 'Source fresh produce directly from farmers and distributors',
      icon: <Store className="h-8 w-8" />,
      bgImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (authPage === 'login') {
      setLoginData(prev => ({
        ...prev,
        [name]: name === 'rememberMe' ? e.target.checked : value
      }));
    } else if (selectedRole === 'farmer') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (selectedRole === 'distributor') {
      setBusinessFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (selectedRole === 'shopkeeper') {
      setshopFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validatePassword = () => {
    let password = '';
    let confirmPassword = '';
    if (selectedRole === 'farmer') {
      password = formData.password;
      confirmPassword = formData.confirmPassword;
    } else if (selectedRole === 'distributor') {
      password = businessFormData.password;
      confirmPassword = businessFormData.confirmPassword;
    } else if (selectedRole === 'shopkeeper') {
      password = shopFormData.password;
      confirmPassword = shopFormData.confirmPassword;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.emailOrPhone || !loginData.password) {
      console.error("❌ Phone number and password are required!");
      return;
    }

    try {
      const response = await api.post("http://localhost:5000/api/auth/login", {
        phoneNumber: loginData.emailOrPhone,
        password: loginData.password
      });

      console.log("🔍 Server Response:", response.data);

      if (response.status === 200) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userId", response.data.user._id);
        localStorage.setItem("name", response.data.user.fullName);

        console.log("✅ Token Stored:", response.data.accessToken);
        console.log("✅ Redirecting to:", response.data.user.role);
        // console.log(response.data.user.sustainabilityBadge, response.data.user.sustainabilityScore)
        const roleRoutes: Record<UserRole, string> = {
          distributor: response.data.user.sustainabilityScore && response.data.user.sustainabilityBadge ? "/DistributorDashboard" : "/DistributorQuestions",
          farmer: response.data.user.sustainabilityScore && response.data.user.sustainabilityBadge ? "/FarmerDashboard" : "/FarmerQuestions",
          shopkeeper: "/ShopkeeperDashboard"
        };

        const userRole = response.data.user.role as UserRole;

        if (roleRoutes[userRole]) {
          navigate(roleRoutes[userRole]);
        } else {
          console.error("❌ Unknown role:", response.data.user.role);
        }
      } else {
        console.error("❌ Login failed:", response.data.message);
      }
    } catch (error: any) {
      console.error("🔥 Error during login:", error.response ? error.response.data.message : error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      console.error("Role must be selected!");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    let apiEndpoint = "";
    let requestBody: any = {};

    if (selectedRole === "farmer") {
      if (!formData.name.trim() || !formData.phone.trim() || !formData.password.trim() || !formData.confirmPassword.trim() || !formData.address.trim()) {
        console.error("All fields are required for farmer!");
        return;
      }
      apiEndpoint = "http://localhost:5000/api/auth/signup/farmer";
      requestBody = {
        fullName: formData.name.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password.trim(),
        address: formData.address.trim()
      };
    } else if (selectedRole === "distributor") {
      if (!businessFormData.name.trim() || !businessFormData.businessName.trim() || !businessFormData.phone.trim() || !businessFormData.address.trim() || !businessFormData.password.trim() || !businessFormData.confirmPassword.trim()) {
        console.error("All fields are required for distributor!");
        return;
      }
      apiEndpoint = "http://localhost:5000/api/auth/signup/distributor";
      requestBody = {
        fullName: businessFormData.name.trim(),
        businessName: businessFormData.businessName.trim(),
        phoneNumber: businessFormData.phone.trim(),
        businessAddress: businessFormData.address.trim(),
        password: businessFormData.password.trim()
      };
    } else if (selectedRole === "shopkeeper") {
      if (!shopFormData.name.trim() || !shopFormData.shopName.trim() || !shopFormData.phone.trim() || !shopFormData.address.trim() || !shopFormData.password.trim() || !shopFormData.confirmPassword.trim()) {
        console.error("All fields are required for shopkeeper!");
        return;
      }
      apiEndpoint = "http://localhost:5000/api/auth/signup/shopkeeper";
      requestBody = {
        fullName: shopFormData.name.trim(),
        shopName: shopFormData.shopName.trim(),
        phoneNumber: shopFormData.phone.trim(),
        businessAddress: shopFormData.address.trim(),
        password: shopFormData.password.trim()
      };
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Signup successful:", data);
        localStorage.setItem("token", data.token);
        setSignupSuccess(true); // ✅ Show success message
        setTimeout(() => {
          setSignupSuccess(false);
          switchAuthPage('login'); // ✅ Redirect to login page after 2 seconds
        }, 2000);
      } else {
        console.error("Signup failed:", data.message);
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentStep('details');
  };

  const goBack = () => {
    if (currentStep === 'otp') {
      setCurrentStep('details');
      setOtp(['', '', '', '', '', '']);
      setIsOtpSent(false);
    } else {
      setCurrentStep('role');
      setSelectedRole(null);
    }
  };

  const switchAuthPage = (page: AuthPage) => {
    setAuthPage(page);
    if (page === 'signup') {
      setCurrentStep('role');
      setSelectedRole(null);
      setFormData({ name: '', phone: '', address: '', password: '', confirmPassword: '' });
      setBusinessFormData({ name: '', businessName: '', phone: '', address: '', password: '', confirmPassword: '' });
      setshopFormData({ name: '', shopName: '', phone: '', address: '', password: '', confirmPassword: '' });
    }
  };

  const getBackgroundImage = () => {
    if (authPage === 'login') {
      return 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070")';
    }
    return selectedRole 
      ? `url("${roleOptions.find(r => r.id === selectedRole)?.bgImage}")`
      : 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070")';
  };

  const renderBusinessSignupForm = () => {
    const businessType = selectedRole === 'distributor' ? 'Distribution Business' : 'Shop';

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 text-green-600 cursor-pointer" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
          <span>Back to roles</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Sign up as a {selectedRole === 'distributor' ? 'Distributor' : 'Shopkeeper'}
          </h2>
          <p className="mt-2 text-gray-600">Fill in your details to create your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={businessFormData.name}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              {businessType} Name
            </label>
            <div className="mt-1 relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={businessFormData.businessName}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`Enter your ${businessType.toLowerCase()} name`}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1 relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={businessFormData.phone}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+1234567890"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Business Address</label>
            <div className="mt-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="address"
                name="address"
                value={businessFormData.address}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`Enter your ${businessType.toLowerCase()} address`}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={businessFormData.password}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Create a strong password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={businessFormData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
        >
          Sign up
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchAuthPage('login')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    );
  };

  const renderShopkeeperSignupForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 text-green-600 cursor-pointer" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
          <span>Back to roles</span>
        </div>
  
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Sign up as a Shopkeeper</h2>
          <p className="mt-2 text-gray-600">Fill in your details to create your account</p>
        </div>
  
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={shopFormData.name}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="John Doe"
              required
            />
          </div>
  
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">Shop Name</label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={shopFormData.shopName}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="Enter shop name"
              required
            />
          </div>
  
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={shopFormData.phone}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="+1234567890"
              required
            />
          </div>
  
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Business Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={shopFormData.address}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="Enter your shop address"
              required
            />
          </div>
  
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={shopFormData.password}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="Create a strong password"
              required
            />
          </div>
  
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={shopFormData.confirmPassword}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:ring-2 focus:ring-green-500"
              placeholder="Confirm your password"
              required
            />
          </div>

          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>
  
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
        >
          Sign up
        </button>
  
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchAuthPage('login')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    );
  };  

  const renderFarmerSignupForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-2 text-green-600 cursor-pointer" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
          <span>Back to roles</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Sign up as a Farmer</h2>
          <p className="mt-2 text-gray-600">Fill in your details to create your account</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Your Address</label>
            <div className="mt-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Hyderabad"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1 relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="+1234567890"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Create a strong password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
        >
          Sign up
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => switchAuthPage('login')}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    );
  };

  const renderSignupSuccess = () => (
    <div className="text-center space-y-4">
      <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-800">Sign Up Successful!</h2>
      <p className="text-gray-600">You have successfully signed up. Redirecting to sign in...</p>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative transition-all duration-500"
      style={{ backgroundImage: getBackgroundImage() }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="max-w-4xl w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-800">Farm2Fork</span>
          </div>
          <nav className="space-x-4">
            <a href="/" className="text-gray-600 hover:text-green-600">Home</a>
            <a href="#" className="text-gray-600 hover:text-green-600">Help</a>
          </nav>
        </div>

        {authPage === 'login' ? (
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
              <p className="mt-2 text-gray-600">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-6"> {/* ✅ Fixed to use handleLogin */}
              <div>
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700">
                  Email or Phone Number
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="emailOrPhone"
                    name="emailOrPhone"
                    value={loginData.emailOrPhone}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email or phone"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-lg border border-gray-300 py-3 px-4 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={loginData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
              >
                Sign in
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthPage('signup')}
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        ) : (
          signupSuccess ? (
            renderSignupSuccess() // ✅ Show success message
          ) : currentStep === 'role' ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Join Farm2Fork</h2>
                <p className="mt-2 text-gray-600">Choose your role to get started</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {roleOptions.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="group relative bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:border-green-500 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-green-100 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                        {role.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{role.title}</h3>
                      <p className="text-gray-600 text-sm">{role.description}</p>
                      <ChevronRight className="h-6 w-6 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchAuthPage('login')}
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          ) : (
            selectedRole === 'farmer' ? renderFarmerSignupForm() : selectedRole === 'distributor' ? renderBusinessSignupForm() : renderShopkeeperSignupForm()
          )
        )}
      </div>
    </div>
  );
}

export default LoginSignup;