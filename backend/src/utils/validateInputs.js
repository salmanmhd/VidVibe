const validateInput = (requiredFields) => {
  return Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
};

export { validateInput };
