'use client';
import { useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  return {
    message,
    show: (nextMessage: string) => setMessage(nextMessage),
    clear: () => setMessage(''),
  };
}
