import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { auth, db } from '../firebaseConfig';
import firebase from 'firebase/compat/app';

// Constant for the single admin email
const ADMIN_EMAIL = 'admin@gmail.com';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // STRICT RULE: Only admin@gmail.com is ADMIN. Everyone else is CLIENT.
          const determinedRole = firebaseUser.email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.CLIENT;
          // Bypass verification logic for now
          const isVerified = true; 

          // Fetch extra user data from Firestore
          const userDocRef = db.collection("users").doc(firebaseUser.uid);
          
          try {
            const userDoc = await userDocRef.get();
            
            if (userDoc.exists) {
              const userData = userDoc.data();
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: userData?.name || firebaseUser.displayName || 'Usuário',
                role: determinedRole,
                phone: userData?.phone || '',
                avatar: userData?.avatar || null,
                emailVerified: isVerified
              });
            } else {
              // Fallback
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email!,
                role: determinedRole,
                emailVerified: isVerified
              });
            }
          } catch (firestoreError) {
            console.error("Erro ao buscar perfil do usuário (Firestore):", firestoreError);
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email!,
              role: determinedRole,
              avatar: null,
              emailVerified: isVerified
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const signUp = async (email: string, password: string, name: string, phone: string, role: UserRole = UserRole.CLIENT) => {
    // 1. Create Auth User FIRST
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    if (firebaseUser) {
      try {
        // Send Email Verification (Best effort - don't block if it fails)
        if (email !== ADMIN_EMAIL) {
          try {
            await firebaseUser.sendEmailVerification();
          } catch (emailError) {
            console.warn("Could not send verification email (ignoring for now):", emailError);
          }
        }

        // Determine correct role for storage
        const finalRole = firebaseUser.email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.CLIENT;
        
        // 2. Create user document
        const userRef = db.collection("users").doc(firebaseUser.uid);
        
        await userRef.set({
          name,
          email,
          phone,
          role: finalRole,
          createdAt: new Date().toISOString()
        });

        // 3. Attempt to increment counter
        try {
           const counterRef = db.collection('settings').doc('userCounter');
           await counterRef.set({
             totalUsers: firebase.firestore.FieldValue.increment(1)
           }, { merge: true });
        } catch (counterError) {
           console.warn("Could not increment user counter:", counterError);
        }

        // Update local state immediately (Assume verified to allow access)
        setUser({
          id: firebaseUser.uid,
          email,
          name,
          phone,
          role: finalRole,
          emailVerified: true
        });

      } catch (error: any) {
        console.error("SignUp Error:", error);
        if (auth.currentUser) {
            try { await auth.currentUser.delete(); } catch(e) { console.error("Failed to rollback auth user", e); }
        }
        throw error;
      }
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const userDocRef = db.collection("users").doc(user.id);
      await userDocRef.set(updates, { merge: true });
      setUser({ ...user, ...updates });
    } catch (err) {
      console.error("Error updating user profile:", err);
      throw err;
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      await auth.currentUser.sendEmailVerification();
    }
  };

  const reloadUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await firebaseUser.reload();
      // Forcing true for now to bypass check
      setUser((prev) => prev ? { ...prev, emailVerified: true } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, updateUser, sendVerificationEmail, reloadUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};