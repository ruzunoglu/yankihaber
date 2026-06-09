"use client";

import { useEffect } from 'react';
import { incrementTotalReads } from '../services/adminService';

export default function ReadTracker() {
  useEffect(() => {
    incrementTotalReads().catch(console.error);
  }, []);

  return null;
}
