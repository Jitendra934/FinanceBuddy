import { useRef, useState } from 'react'
import { userAPI } from '../service/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const navigate = useNavigate();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerificationCodeSubmitted, setIsVerificationCodeSubmitted] = useState(false);
  const inputRef = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length === 1 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0 && e.key === 'ArrowLeft') {
      inputRef.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text').split('');
    pastedData.forEach((char, index) => {
      if (index < inputRef.current.length) {
        inputRef.current[index].value = char;
        if (index < inputRef.current[index].length - 1) {
          inputRef.current[index + 1].focus();
        }
      }
    });
  }

  const handleVerificationCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const verificationCode = inputRef.current.map(el => el.value).join('');
      if (verificationCode.length < 6) {
        alert('Please enter a valid 6-digit verification code.');
        return;
      } 
      setVerificationCode(verificationCode);
      setIsVerificationCodeSubmitted(true);     
    } catch (error) {
      toast.error('Failed to submit verification code:', error.message)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.sendResetPasswordVerificationEmail(email);
      if(response?.data?.success) {
        setIsEmailSent(true);
        toast.success('Verification email sent successfully!');
      }
    } catch (error) {
      toast.error('Failed to send verification email:', error.message);
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.ResetPassword(email, verificationCode, newPassword);
      if(response?.data?.success) {
        toast.success('Password Reset successfully!');
        navigate('/signin');
      }
    } catch (error) {
      toast.error('Failed to reset password:', error.message);
    }
  }


  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Reset Password</h1>
        </div>
        {!isEmailSent && (
          <form className='mt-8 space-y-6' onSubmit={handleEmailSubmit}>
            <div className='rounded-md shadow-sm -space-y-px'>
              <div>
                <label htmlFor='email' className='sr-only'>Email address</label>
                <input
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  placeholder='Email address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type='submit'
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Verify Email
              </button>
            </div>
          </form>
        )}

        {isEmailSent && !isVerificationCodeSubmitted && (
          <form className='mt-8 space-y-6' onSubmit={(e) => handleVerificationCodeSubmit(e)}>
            <div className='flex flex-col items-center space-y-4'>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter the 6-digit verification code sent to your email address.
              </p>
              <div className='flex justify-center space-x-2' onPaste={(e) => handlePaste(e)}>
                {Array(6).fill().map((_, index) => (
                  <input
                    key={index}
                    type='text'
                    maxLength={1}
                    className='w-10 h-10 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
                    ref={el => inputRef.current[index] = el}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>
            </div>
            <div>
              <button
                type='submit'
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Verify Code
              </button>
            </div>
          </form>
        )}

        {isEmailSent && isVerificationCodeSubmitted && (
          <form className='mt-8 space-y-6' onSubmit={(e) => handlePasswordReset(e)}>
            <div className='rounded-md shadow-sm -space-y-px'>
              <div>
                <label htmlFor='newPassword' className='sr-only'>New Password</label>
                <input
                  name='newPassword'
                  type='password'
                  required
                  className='appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  placeholder='New Password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type='submit'
                className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Reset Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword