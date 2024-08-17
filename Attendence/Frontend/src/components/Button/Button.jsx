import React from 'react';
import './Button.css'

const Button = ({ onClick, type, disabled, label }) => {
  return (
    <button className='button' onClick={onClick} disabled={disabled} type={type}>
      {label}
    </button>
  );
};

export default Button;
