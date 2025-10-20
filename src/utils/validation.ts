export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'La contraseña no puede tener más de 128 caracteres' }
  }
  
  return { isValid: true }
}

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}

export const validateFullName = (name: string): { isValid: boolean; message?: string } => {
  if (name.trim().length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' }
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, message: 'El nombre no puede tener más de 100 caracteres' }
  }
  
  return { isValid: true }
}