#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * Script para validar que la nueva arquitectura está correctamente implementada
 */

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath))
}

function checkDirectoryExists(dirPath) {
  return fs.existsSync(path.join(__dirname, '..', dirPath))
}

function validateArchitecture() {
  log('🏗️  Validando Clean Architecture Implementation...', 'blue')
  console.log()

  let errors = 0
  let warnings = 0

  // Validar estructura de directorios
  log('📁 Validando estructura de directorios...', 'yellow')
  
  const requiredDirs = [
    'src/domain/entities',
    'src/domain/value-objects',
    'src/domain/repositories',
    'src/domain/services',
    'src/application/booking',
    'src/infrastructure/repositories',
    'src/infrastructure/container',
    'src/presentation/components',
    'src/presentation/hooks'
  ]

  requiredDirs.forEach(dir => {
    if (checkDirectoryExists(dir)) {
      log(`  ✅ ${dir}`, 'green')
    } else {
      log(`  ❌ ${dir} - FALTA`, 'red')
      errors++
    }
  })

  console.log()

  // Validar archivos clave
  log('📄 Validando archivos clave...', 'yellow')
  
  const requiredFiles = [
    // Domain Layer
    'src/domain/entities/Booking.ts',
    'src/domain/entities/Property.ts',
    'src/domain/entities/User.ts',
    'src/domain/value-objects/BookingStatus.ts',
    'src/domain/value-objects/DateRange.ts',
    'src/domain/value-objects/ContactInfo.ts',
    'src/domain/value-objects/Email.ts',
    'src/domain/repositories/BookingRepository.ts',
    'src/domain/repositories/PropertyRepository.ts',
    'src/domain/services/AvailabilityService.ts',
    'src/domain/services/BookingDomainService.ts',
    
    // Application Layer
    'src/application/booking/CreateBookingUseCase.ts',
    'src/application/booking/GetBookingUseCase.ts',
    'src/application/booking/GetUserBookingsUseCase.ts',
    'src/application/booking/CompletePaymentUseCase.ts',
    'src/application/booking/CancelBookingUseCase.ts',
    'src/application/services/BookingService.ts',
    
    // Infrastructure Layer
    'src/infrastructure/repositories/SupabaseBookingRepository.ts',
    'src/infrastructure/repositories/SupabasePropertyRepository.ts',
    'src/infrastructure/container/Container.ts',
    
    // Presentation Layer
    'src/presentation/components/booking/BookingFormV2.tsx',
    'src/presentation/components/booking/UserBookingsList.tsx',
    'src/presentation/hooks/useBooking.ts',
    
    // API v2
    'src/app/api/v2/bookings/route.ts',
    'src/app/api/v2/bookings/[id]/route.ts'
  ]

  requiredFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file}`, 'green')
    } else {
      log(`  ❌ ${file} - FALTA`, 'red')
      errors++
    }
  })

  console.log()

  // Validar tests
  log('🧪 Validando tests...', 'yellow')
  
  const testFiles = [
    'src/__tests__/domain/entities/Booking.test.ts',
    'src/__tests__/domain/value-objects/DateRange.test.ts',
    'src/__tests__/application/booking/CreateBookingUseCase.test.ts',
    'jest.config.js',
    'jest.setup.js'
  ]

  testFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file}`, 'green')
    } else {
      log(`  ⚠️  ${file} - RECOMENDADO`, 'yellow')
      warnings++
    }
  })

  console.log()

  // Validar documentación
  log('📚 Validando documentación...', 'yellow')
  
  const docFiles = [
    'CLEAN-ARCHITECTURE.md',
    'MIGRATION-GUIDE.md'
  ]

  docFiles.forEach(file => {
    if (checkFileExists(file)) {
      log(`  ✅ ${file}`, 'green')
    } else {
      log(`  ⚠️  ${file} - RECOMENDADO`, 'yellow')
      warnings++
    }
  })

  console.log()

  // Validar package.json
  log('📦 Validando configuración...', 'yellow')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
    
    // Verificar scripts de test
    if (packageJson.scripts && packageJson.scripts.test) {
      log('  ✅ Scripts de test configurados', 'green')
    } else {
      log('  ❌ Scripts de test faltantes', 'red')
      errors++
    }

    // Verificar dependencias de test
    const testDeps = ['jest', '@testing-library/jest-dom', '@testing-library/react']
    const devDeps = packageJson.devDependencies || {}
    
    testDeps.forEach(dep => {
      if (devDeps[dep]) {
        log(`  ✅ ${dep} instalado`, 'green')
      } else {
        log(`  ⚠️  ${dep} no encontrado`, 'yellow')
        warnings++
      }
    })

  } catch (error) {
    log('  ❌ Error leyendo package.json', 'red')
    errors++
  }

  console.log()

  // Resumen
  log('📊 Resumen de Validación', 'blue')
  console.log('─'.repeat(50))
  
  if (errors === 0 && warnings === 0) {
    log('🎉 ¡Arquitectura completamente implementada!', 'green')
    log('✨ Todo está en orden. La Clean Architecture está correctamente configurada.', 'green')
  } else if (errors === 0) {
    log(`✅ Arquitectura básica implementada correctamente`, 'green')
    log(`⚠️  ${warnings} elementos recomendados faltantes`, 'yellow')
    log('💡 Considera completar los elementos marcados como recomendados.', 'yellow')
  } else {
    log(`❌ ${errors} errores críticos encontrados`, 'red')
    log(`⚠️  ${warnings} advertencias`, 'yellow')
    log('🔧 Corrige los errores antes de continuar.', 'red')
  }

  console.log()

  // Próximos pasos
  if (errors === 0) {
    log('🚀 Próximos pasos sugeridos:', 'blue')
    log('  1. Ejecutar tests: npm run test', 'reset')
    log('  2. Migrar componentes legacy', 'reset')
    log('  3. Actualizar imports en páginas existentes', 'reset')
    log('  4. Probar funcionalidad completa', 'reset')
    
    if (warnings > 0) {
      log('  5. Completar elementos recomendados', 'reset')
    }
  } else {
    log('🔧 Acciones requeridas:', 'blue')
    log('  1. Crear archivos faltantes marcados con ❌', 'reset')
    log('  2. Ejecutar este script nuevamente', 'reset')
    log('  3. Continuar con próximos pasos cuando no haya errores', 'reset')
  }

  console.log()
  
  return { errors, warnings }
}

// Ejecutar validación
if (require.main === module) {
  const result = validateArchitecture()
  process.exit(result.errors > 0 ? 1 : 0)
}

module.exports = { validateArchitecture }