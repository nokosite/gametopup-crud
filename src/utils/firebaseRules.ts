// Firestore Security Rules untuk aplikasi Game Store
// Copy rules ini ke Firebase Console > Firestore Database > Rules

export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to games collection for all users (development)
    match /games/{gameId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to transactions for all users (development)
    match /transactions/{transactionId} {
      allow read, write: if true;
    }
    
    // Allow read/write access to users collection for all users (development)
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Default rule - allow all access for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;

// Production rules (use this for production)
export const productionFirestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to games collection for all authenticated users
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Allow read/write access to transactions for authenticated users
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow read/write access to users collection for authenticated users
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default rule - deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

// Helper function to check if user has proper authentication
export const checkUserAuth = (auth: any) => {
  if (!auth.currentUser) {
    console.log('No authenticated user, continuing without auth for development');
    return null;
  }
  return auth.currentUser;
};

// Helper function to validate data before writing to Firestore
export const validateGameData = (gameData: any) => {
  if (!gameData.gameName || !gameData.gameName.trim()) {
    throw new Error('Game name is required');
  }
  
  if (!gameData.gameIcon || !gameData.gameIcon.trim()) {
    throw new Error('Game icon URL is required');
  }
  
  if (!gameData.category) {
    throw new Error('Game category is required');
  }
  
  if (!Array.isArray(gameData.topupOptions) || gameData.topupOptions.length === 0) {
    throw new Error('At least one topup option is required');
  }
  
  return true;
}; 