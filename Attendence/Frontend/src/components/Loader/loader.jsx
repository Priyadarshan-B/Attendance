import React from 'react';
import './loader.css'; // Create a separate CSS file for the loader styles

const Loader = () => (
  <div className='loader'>
      <div className="spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
  </div>
);

export default Loader;
