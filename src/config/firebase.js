/**
 * Mock Firebase Configuration
 * 
 * This file provides empty mock objects for Firebase services.
 * All Firebase functionality has been removed from the project.
 * These exports prevent import errors in files that still reference Firebase.
 * 
 * The application now uses static data instead of Firebase.
 */

// Empty mock objects - no actual Firebase functionality
const app = {};
const auth = {};
const db = {};
const storage = {};

// Export mocks to prevent import errors
export { auth, db, storage };
export default app;
