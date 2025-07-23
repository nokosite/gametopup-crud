export interface FirebaseError {
  code: string;
  message: string;
}

export const handleFirebaseAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    const errorMessage = error.message;
    
    // Firebase Auth error codes
    if (errorMessage.includes('auth/invalid-credential')) {
      return 'Email atau password salah';
    } else if (errorMessage.includes('auth/user-not-found')) {
      return 'Akun tidak ditemukan';
    } else if (errorMessage.includes('auth/wrong-password')) {
      return 'Password salah';
    } else if (errorMessage.includes('auth/email-already-in-use')) {
      return 'Email sudah terdaftar';
    } else if (errorMessage.includes('auth/weak-password')) {
      return 'Password terlalu lemah (minimal 6 karakter)';
    } else if (errorMessage.includes('auth/invalid-email')) {
      return 'Format email tidak valid';
    } else if (errorMessage.includes('auth/too-many-requests')) {
      return 'Terlalu banyak percobaan. Coba lagi nanti';
    } else if (errorMessage.includes('auth/network-request-failed')) {
      return 'Koneksi internet bermasalah';
    } else if (errorMessage.includes('auth/user-disabled')) {
      return 'Akun telah dinonaktifkan';
    } else if (errorMessage.includes('auth/operation-not-allowed')) {
      return 'Operasi tidak diizinkan';
    } else if (errorMessage.includes('auth/account-exists-with-different-credential')) {
      return 'Akun sudah ada dengan kredensial berbeda';
    }
    
    return errorMessage;
  }
  
  return 'Terjadi kesalahan yang tidak diketahui';
};

export const handleFirebaseFirestoreError = (error: unknown): string => {
  if (error instanceof Error) {
    const errorMessage = error.message;
    const errorCode = (error as any).code;
    
    // Firestore error codes
    if (errorCode === 'permission-denied' || errorMessage.includes('permission-denied')) {
      return 'Tidak memiliki izin untuk mengakses data';
    } else if (errorCode === 'unavailable' || errorMessage.includes('unavailable')) {
      return 'Layanan tidak tersedia. Cek koneksi internet';
    } else if (errorCode === 'deadline-exceeded' || errorMessage.includes('deadline-exceeded')) {
      return 'Permintaan timeout. Coba lagi';
    } else if (errorCode === 'resource-exhausted' || errorMessage.includes('resource-exhausted')) {
      return 'Batas penggunaan terlampaui';
    } else if (errorCode === 'failed-precondition' || errorMessage.includes('failed-precondition')) {
      return 'Kondisi tidak terpenuhi';
    } else if (errorCode === 'aborted' || errorMessage.includes('aborted')) {
      return 'Operasi dibatalkan';
    } else if (errorCode === 'out-of-range' || errorMessage.includes('out-of-range')) {
      return 'Data di luar batas';
    } else if (errorCode === 'unimplemented' || errorMessage.includes('unimplemented')) {
      return 'Fitur belum diimplementasi';
    } else if (errorCode === 'internal' || errorMessage.includes('internal')) {
      return 'Kesalahan internal server';
    } else if (errorCode === 'data-loss' || errorMessage.includes('data-loss')) {
      return 'Data hilang';
    } else if (errorCode === 'unauthenticated' || errorMessage.includes('unauthenticated')) {
      return 'Silakan login terlebih dahulu';
    } else if (errorMessage.includes('transport') || errorMessage.includes('WebChannelConnection')) {
      return 'Koneksi ke server bermasalah. Coba lagi dalam beberapa saat';
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'Koneksi internet bermasalah. Pastikan Anda terhubung ke internet';
    } else if (errorMessage.includes('timeout')) {
      return 'Permintaan timeout. Coba lagi';
    }
    
    return errorMessage;
  }
  
  return 'Terjadi kesalahan pada database';
};

export const handleNetworkError = (error: unknown): string => {
  if (error instanceof Error) {
    const errorMessage = error.message;
    
    if (errorMessage.includes('Network request failed')) {
      return 'Koneksi internet bermasalah';
    } else if (errorMessage.includes('timeout')) {
      return 'Permintaan timeout';
    } else if (errorMessage.includes('fetch')) {
      return 'Gagal mengambil data dari server';
    } else if (errorMessage.includes('transport')) {
      return 'Koneksi ke server bermasalah';
    } else if (errorMessage.includes('connection')) {
      return 'Koneksi internet bermasalah';
    }
    
    return errorMessage;
  }
  
  return 'Kesalahan jaringan';
};

export const handleGenericError = (error: unknown, context: string = 'operasi'): string => {
  if (error instanceof Error) {
    const errorMessage = error.message;
    
    if (errorMessage.includes('transport') || errorMessage.includes('WebChannelConnection')) {
      return 'Koneksi ke server bermasalah. Coba lagi dalam beberapa saat';
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'Koneksi internet bermasalah. Pastikan Anda terhubung ke internet';
    } else if (errorMessage.includes('timeout')) {
      return 'Permintaan timeout. Coba lagi';
    }
    
    return `Gagal melakukan ${context}: ${errorMessage}`;
  }
  
  return `Gagal melakukan ${context}`;
}; 