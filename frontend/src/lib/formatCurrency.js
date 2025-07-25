  export const formatCurrency = (value) => {
    const numeric = Number(value.toString().replace(/[^0-9.-]+/g, "")); //[^0-9.-] --match anything except digits (0-9), a dot (.), or minus sign (-)
    if (isNaN(numeric)) return value;                     //"" — replace the matched characters with nothing (i.e., remove them)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',  //'INR'
      minimumFractionDigits: 2,
    }).format(numeric);
  };