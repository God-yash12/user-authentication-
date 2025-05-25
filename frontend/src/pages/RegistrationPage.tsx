
import React from 'react';
import RegistrationForm from '../components/RegistrationForm';

const RegistrationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Join Us
        </h1>
        <p className="text-lg text-gray-300 mt-2">Create your account to get started.</p>
      </header>
      <RegistrationForm />
       <footer className="mt-12 text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} SecureApp Inc. All rights reserved (not really).
        </p>
      </footer>
    </div>
  );
};

export default RegistrationPage;
    