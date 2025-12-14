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
          // Bypass verification for admin
          const isVerified = firebaseUser.email === ADMIN_EMAIL ? true : firebaseUser.emailVerified;

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
                role: determinedRole, // Force strict role based on email
                phone: userData?.phone || '',
                avatar: userData?.avatar || null,
                emailVerified: isVerified
              });
            } else {
              // Document doesn't exist, create a fallback user object locally
              // This can happen if signup created auth but failed firestore write
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email!,
                role: determinedRole, // Force strict role based on email
                emailVerified: isVerified
              });
            }
          } catch (firestoreError) {
            console.error("Erro ao buscar perfil do usuário (Firestore):", firestoreError);
            // Fallback in case of database permission error or other issue
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
        // Send Email Verification ONLY if not admin
        if (email !== ADMIN_EMAIL) {
          await firebaseUser.sendEmailVerification();
        }

        // Determine correct role for storage
        const finalRole = firebaseUser.email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.CLIENT;
        const isVerified = firebaseUser.email === ADMIN_EMAIL;

        // 2. Create user document ONLY. 
        // We decouple the counter increment to prevent permission errors from blocking the core user creation.
        // A user should always have permission to write to their own document (users/{uid}).
        const userRef = db.collection("users").doc(firebaseUser.uid);
        
        await userRef.set({
          name,
          email,
          phone,
          role: finalRole,
          createdAt: new Date().toISOString()
        });

        // 3. Attempt to increment counter separately. Fail silently if permissions deny.
        try {
           const counterRef = db.collection('settings').doc('userCounter');
           await counterRef.set({
             totalUsers: firebase.firestore.FieldValue.increment(1)
           }, { merge: true });
        } catch (counterError) {
           console.warn("Could not increment user counter (likely permission issue), ignoring:", counterError);
           // We do NOT rollback here, because the user account is successfully created and usable.
        }

        // Update local state immediately
        setUser({
          id: firebaseUser.uid,
          email,
          name,
          phone,
          role: finalRole,
          emailVerified: isVerified
        });

      } catch (error: any) {
        console.error("SignUp Error:", error);
        // Rollback: If writing the user profile failed (critical), we delete the Auth user to prevent "zombie" accounts
        // that have login but no data.
        if (auth.currentUser) {
            try { await auth.currentUser.delete(); } catch(e) { console.error("Failed to rollback auth user", e); }
        }
        
        // Propagate error to the UI
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
    
    // Update in Firestore
    try {
      const userDocRef = db.collection("users").doc(user.id);
      await userDocRef.set(updates, { merge: true });
      
      // Update local state
      setUser({ ...user, ...updates });
    } catch (err) {
      console.error("Error updating user profile:", err);
      throw err;
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified && auth.currentUser.email !== ADMIN_EMAIL) {
      await auth.currentUser.sendEmailVerification();
    }
  };

  // NEW: Manual reload of user to check verification status without page refresh
  const reloadUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await firebaseUser.reload();
      // Force update local state with new emailVerified status
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          emailVerified: firebaseUser.email === ADMIN_EMAIL ? true : firebaseUser.emailVerified
        };
      });
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