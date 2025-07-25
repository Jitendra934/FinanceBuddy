import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../service/api';
import useUserStore from '../store/useUserStore';
import toast from 'react-hot-toast';

const VerifyEmail = () => {

  const inputRef = useRef([]);
  const navigate = useNavigate();
  const isLoggedIn = useUserStore(state => state.isLoggedIn);
  const userData = useUserStore(state => state.userData);
  const checkAuth = useUserStore(state => state.checkAuth);


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = inputRef.current.map(el => el.value).join('');
    if (verificationCode.length < 6) {
      toast.error('Please enter a complete 6-digit verification code.');
      return;
    }
    try {
      const response = await userAPI.verifyEmail(verificationCode);
      if (response.data.success) {
        toast.success('Email verified successfully!');
        checkAuth();
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Verification failed:', error.message);
    }
  }

  useEffect(() => {
    inputRef.current[0].focus();
  }, [])

  useEffect(() => {
    if (isLoggedIn && userData && userData.isVerified) {
      navigate('/dashboard');
    } else if (isLoggedIn && userData && !userData.isVerified) {
      checkAuth();
    }
  }, [isLoggedIn, userData])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className="max-w-md w-full space-y-8  border border-gray-200 rounded-lg shadow-lg p-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit verification code sent to your email address.
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={(e) => handleSubmit(e)}>
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
          <div className='mt-8'>
            <button
              type='submit'
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
              Verify Code
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VerifyEmail