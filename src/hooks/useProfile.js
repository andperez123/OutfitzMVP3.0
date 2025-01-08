import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase-config';
import { signInWithPopup } from 'firebase/auth';

export const useProfile = () => {
    const [user, setUser] = useState(null);
    const [bodyType, setBodyType] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [height, setHeight] = useState('');
    const [hairType, setHairType] = useState('');
    const [isProfileSaved, setIsProfileSaved] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            console.log('Starting Google Sign In...');
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Sign in successful:', result.user);
            setUser(result.user);
        } catch (error) {
            console.error("Error signing in with Google: ", error.code, error.message);
        }
    };

    const saveUserProfile = () => {
        // Your existing save profile logic
        setIsProfileSaved(true);
    };

    return {
        user,
        bodyType,
        setBodyType,
        ethnicity,
        setEthnicity,
        height,
        setHeight,
        hairType,
        setHairType,
        isProfileSaved,
        handleGoogleSignIn,
        saveUserProfile
    };
};