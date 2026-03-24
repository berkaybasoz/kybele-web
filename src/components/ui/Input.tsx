import { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={clsx('input', className)} {...props} />;
  },
);

Input.displayName = 'Input';
