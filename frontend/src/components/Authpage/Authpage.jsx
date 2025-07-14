import React, { useState } from 'react';
import Login from '../../Page/Login';  // Correct import from the page folder
import Signup from '../../Page/UserSignup';  // Correct import from the page folder

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);  // State to toggle between Login and Signup

  return (
    <div>
      {isSignup ? (
        <Signup setIsSignup={setIsSignup} />  // Show Signup when isSignup is true
      ) : (
        <Login setIsSignup={setIsSignup} />  // Show Login when isSignup is false
      )}
    </div>
  );
};

export default AuthPage;
