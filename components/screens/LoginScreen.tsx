import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createUserProfile } from '../../services/firestoreService';
import { FlameIcon, GoogleIcon } from '../icons';

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Register a new user
        if (!name) {
            setError("Please enter your name.");
            setLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create a corresponding user profile document in Firestore
        await createUserProfile({
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            name: name,
            age: 25, // Using mock data for new user profiles for now
            bio: "New to Aura! Let's connect.",
            photos: [`https://picsum.photos/seed/${userCredential.user.uid}/800/1200`],
            energy: ["Newbie"],
            verified: false,
        });
      }
    } catch (err: any) {
      // Display any errors from Firebase
      setError(err.message.replace('Firebase: ', ''));
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile already exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // New user, create profile in Firestore
        await createUserProfile({
          id: user.uid,
          email: user.email!,
          name: user.displayName || 'Aura User',
          age: 25, // Mock data
          bio: "Just joined through Google! Ready to connect.",
          // Use Google photo if available, otherwise a placeholder
          photos: [user.photoURL || `https://picsum.photos/seed/${user.uid}/800/1200`],
          energy: ["Explorer"],
          verified: true, // Google sign-in is considered verified
        });
      }
      // AuthProvider will handle redirecting to the main app after state change
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-sm mx-auto text-white">
        <div className="text-center mb-8">
            <FlameIcon className="w-16 h-16 text-pink-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold">Welcome to Aura</h1>
            <p className="text-slate-400">{isLogin ? "Entre para continuar" : "Crie uma conta para começar"}</p>
        </div>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu Nome"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm font-medium">OU</span>
            <div className="flex-grow border-t border-slate-700"></div>
        </div>
        
        <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-slate-800 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
            <GoogleIcon className="w-5 h-5" />
            <span>Continue com o Google</span>
        </button>

        <div className="text-center mt-6">
          <button onClick={() => setIsLogin(!isLogin)} className="text-pink-400 hover:underline">
            {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;