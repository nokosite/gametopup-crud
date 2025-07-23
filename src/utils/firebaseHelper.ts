// Helper untuk mengatasi Firebase permission issues
export const getFirebaseRulesForDevelopment = () => {
  return `
// Copy dan paste rules ini di Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users under any document
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;
};

export const getFirebaseRulesForProduction = () => {
  return `
// Copy dan paste rules ini di Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Allow users to create tasks
    match /tasks/{taskId} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
`;
};

// Instructions untuk mengatasi permission error
export const getFirebasePermissionFixInstructions = () => {
  return `
🔥 FIX FIREBASE PERMISSION ERROR:

1. Buka https://console.firebase.google.com
2. Pilih project Anda
3. Klik "Firestore Database" di sidebar
4. Klik tab "Rules"
5. Replace semua rules dengan:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

6. Klik "Publish"
7. Tunggu beberapa detik
8. Test aplikasi lagi

⚠️  PERHATIAN: Rules ini hanya untuk development!
   Untuk production, gunakan rules yang lebih aman.
`;
}; 