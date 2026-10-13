import { forwardRef, useState, isValidElement } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Input Component
 * 
 * Accessible form input with labels, validation states, and icons.
 * Follows design tokens for consistent sizing and spacing.
 * Handles text, email, password, number, date, tel types.
 * 
 * @example
 * <Input
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error="Invalid email format"
 *   required
 * />
 * 
 * <Input
 *   label="Password"
 *   type="password"
 *   icon={<Lock className="w-5 h-5" />}
 *   helperText="Min 8 characters"
 * />
 */

const Input = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  helperText,
  icon,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  id,
  name,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Determine state styling
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success);
  
  const borderColor = hasError 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : hasSuccess
    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
    : isFocused
    ? 'border-emerald-500 ring-2 ring-emerald-500'
    : 'border-gray-300';
  
  const bgColor = disabled ? 'bg-gray-50' : 'bg-white';
  
  return (
    <div className={`w-full ${containerClassName}`.trim()}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
            {isValidElement(icon) ? icon : typeof icon === 'function' ? (() => { const Comp = icon; return <Comp className="w-5 h-5" />; })() : null}
          </div>
        )}
        
        {/* Input element */}
        <input
          ref={ref}
          id={inputId}
          name={name || inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${inputId}-error` 
            : helperText ? `${inputId}-helper` 
            : undefined
          }
          className={`
            w-full
            ${icon ? 'pl-11' : 'pl-4'}
            ${type === 'password' ? 'pr-11' : hasError || hasSuccess ? 'pr-11' : 'pr-4'}
            py-2.5
            min-h-[2.75rem]
            ${bgColor}
            border
            ${borderColor}
            rounded-xl
            text-sm
            text-gray-900
            placeholder-gray-400
            transition-all duration-200
            focus:outline-none
            disabled:cursor-not-allowed disabled:opacity-60
            ${className}
          `.trim()}
          {...props}
        />
        
        {/* Right icon/indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Password visibility toggle */}
          {type === 'password' && !hasError && !hasSuccess && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
          
          {/* Error indicator */}
          {hasError && (
            <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />
          )}
          
          {/* Success indicator */}
          {hasSuccess && !hasError && (
            <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />
          )}
        </div>
      </div>
      
      {/* Error message */}
      {hasError && (
        <p 
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-start gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
      
      {/* Success message */}
      {hasSuccess && !hasError && (
        <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !hasError && !hasSuccess && (
        <p 
          id={`${inputId}-helper`}
          className="mt-1.5 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
