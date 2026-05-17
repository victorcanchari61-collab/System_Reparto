import React from 'react';

interface FormGridProps {
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
}

/** Grid responsivo para campos de formulario. 1 col en mobile, N cols en sm+. */
const colClass = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };

const FormGrid: React.FC<FormGridProps> = ({ cols = 2, children }) => (
  <div className={`grid grid-cols-1 ${colClass[cols]} gap-3`}>
    {children}
  </div>
);

export default FormGrid;
