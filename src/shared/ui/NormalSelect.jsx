import React from 'react';
import SearchableSelect from './searchable-select';

const NormalSelect = React.forwardRef(
  ({ label, options, error, ...rest }, ref) => (
    <SearchableSelect
      ref={ref}
      label={label}
      options={options}
      error={error}
      placeholder="اختر"
      {...rest}
    />
  )
);

export default NormalSelect;
