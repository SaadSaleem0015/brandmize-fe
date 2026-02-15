
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
  
    const day = date.getUTCDate();
    const month = date.toLocaleString('default', { month: 'long' }); 
    const year = date.getUTCFullYear();
  
    return `${month} ${day} ${year}`;
  };
  