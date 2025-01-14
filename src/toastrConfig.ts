import toastr from 'toastr'
import 'toastr/build/toastr.css'

// Configuración global de toastr
toastr.options = {
  positionClass: 'toast-top-center',
  timeOut: 3000,
  closeButton: true,
  progressBar: true,
  preventDuplicates: true,
  opacity: 1,
  toastClass: 'custom-toast'
}

// Estilos personalizados para los toasts
const style = document.createElement('style')
style.textContent = `
  .custom-toast {
    background-color: white !important;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
    border-radius: 0.5rem !important;
  }
  
  .toast-success {
    background-color: #10b981 !important;
    color: white !important;
  }
  
  .toast-error {
    background-color: #ef4444 !important;
    color: white !important;
  }
  
  .toast-info {
    background-color: #3b82f6 !important;
    color: white !important;
  }
  
  .toast-warning {
    background-color: #eab308 !important;
    color: white !important;
  }

  #toast-container {
    margin-top: 1rem;
  }

  .toast-close-button {
    color: currentColor !important;
    opacity: 0.8 !important;
  }

  .toast-close-button:hover {
    opacity: 1 !important;
  }
`

document.head.appendChild(style)

export default toastr