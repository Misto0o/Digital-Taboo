import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    deleteDoc,
} from 'firebase/firestore';

// generates a random 4-letter room code like "X7K2"
function generateCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

export function useRoom() {
    const [roomCode, setRoomCode] = useState(null);
    const [roomState, setRoomState] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [error, setError] = useState(null);

    // listen for real-time updates on the room
    useEffect(() => {
        if (!roomCode) return;
        const unsub = onSnapshot(doc(db, 'rooms', roomCode), (snap) => {
            if (snap.exists()) {
                setRoomState(snap.data());
            } else {
                // room was deleted (game over cleanup)
                setRoomState(null);
                setRoomCode(null);
            }
        });
        return () => unsub();
    }, [roomCode]);

    // host creates a new room
    const createRoom = async (initialGameState) => {
        const code = generateCode();
        await setDoc(doc(db, 'rooms', code), {
            ...initialGameState,
            createdAt: Date.now(),
        });
        setRoomCode(code);
        setIsHost(true);
        return code;
    };

    // guest joins existing room
    const joinRoom = async (code) => {
        const upper = code.toUpperCase();
        const snap = await getDoc(doc(db, 'rooms', upper));
        if (!snap.exists()) {
            setError('Room not found. Check the code and try again.');
            return false;
        }
        setRoomCode(upper);
        setIsHost(false);
        setError(null);
        return true;
    };

    // host pushes game state updates to Firestore
    const updateRoom = async (newState) => {
        if (!roomCode) return;
        await setDoc(doc(db, 'rooms', roomCode), newState, { merge: true });
    };

    // called on game over — wipes the room
    const deleteRoom = async () => {
        if (!roomCode) return;
        await deleteDoc(doc(db, 'rooms', roomCode));
        setRoomCode(null);
        setRoomState(null);
    };

    return {
        roomCode,
        roomState,
        isHost,
        error,
        createRoom,
        joinRoom,
        updateRoom,
        deleteRoom,
    };
}
