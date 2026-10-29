import './Button.css';

function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
