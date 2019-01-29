import React, { useState } from 'react';

export function useInput(defaultValue) {
  const [value, setValue] = useState(defaultValue);
  let myValue = value;

  if (`${Number(myValue)}` === `${value}`) {
    myValue = Number(value);
  }

  return {
    value: myValue,
    onChange(e) {
      setValue(e.target.value);
    }
  };
}

export function useCheckbox(defaultValue) {
  const [checked, setChecked] = useState(defaultValue);
  return {
    checked,
    onChange(e) {
      setChecked(e.target.checked);
    }
  };
}

export function useSelect(defaultValue) {
  const [value, setValue] = useState(defaultValue);
  return {
    value,
    onChange(val) {
      setValue(val);
    }
  };
}
