// Firebase Admin is no longer used - migrated to Clerk
// This file is kept for backward compatibility but exports a no-op object
// If you need Firebase Admin, install firebase-admin package

// Export a no-op admin object since firebase-admin is not installed
const admin = {
  auth: () => ({
    verifyIdToken: () => Promise.reject(new Error('Firebase Admin not available - using Clerk authentication'))
  })
};

export default admin;
