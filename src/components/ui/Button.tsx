import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger';
};

export function Button({ variant = 'default', className, ...props }: Props) {
  return <button className={clsx('btn', variant !== 'default' && variant, className)} {...props} />;
}
