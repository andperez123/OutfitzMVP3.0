import { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';

export const useProfile = () => {
    const [user, setUser] = useState(null);
    const [bodyType, setBodyType] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [height, setHeight] = useState('');
    const [hairType, setHairType] = useState('');
    const [isProfileSaved, setIsProfileSaved] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleSignIn = async (e) => {
        if (e) {
            e.preventDefault();
        }
        
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            if (result.user) {
                setUser(result.user);
                
                await setDoc(doc(db, 'userProfiles', result.user.uid), {
                    email: result.user.email,
                    bodyType,
                    ethnicity,
                    height,
                    hairType,
                    updatedAt: new Date().toISOString()
                });

                setIsProfileSaved(true);
                alert('Profile saved successfully!');
            }
        } catch (error) {
            console.error('Error signing in and saving profile:', error);
            setError('Failed to sign in and save profile');
        }
    };

    const saveUserProfile = async () => {
        if (!user) return;
        
        try {
            await setDoc(doc(db, 'userProfiles', user.uid), {
                email: user.email,
                bodyType,
                ethnicity,
                height,
                hairType,
                updatedAt: new Date().toISOString()
            });
            setIsProfileSaved(true);
            alert('Profile saved successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            setError('Failed to save profile');
        }
    };

    const loadUserProfile = async (userId) => {
        try {
            const docRef = doc(db, 'userProfiles', userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBodyType(data.bodyType || '');
                setEthnicity(data.ethnicity || '');
                setHeight(data.height || '');
                setHairType(data.hairType || '');
                setIsProfileSaved(true);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setError('Failed to load profile');
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (user) {
                loadUserProfile(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

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
        error,
        handleGoogleSignIn,
        saveUserProfile
    };
};