// export const FormateTime = (dateString: string): string => {
//   const date = new Date(dateString);
//   if (dateString == null) {
//     return '-- -- -- '
//   }
//   if (isNaN(date.getTime())) {
//       return '-- -- --'; 
//   }

//   const day = date.getUTCDate(); 
//   const month = date.toLocaleString('default', { month: 'long' }); 
//   const year = date.getUTCFullYear(); 
//   const hours = date.getUTCHours().toString().padStart(2, '0'); 
//   const minutes = date.getUTCMinutes().toString().padStart(2, '0');

//   return `${day} ${month} ${year}, at ${hours}:${minutes} UTC`;
// };
export const FormateTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (dateString == null || isNaN(date.getTime())) {
    return '-- -- --';
  }

  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); 
  const year = date.getUTCFullYear().toString().slice(-2); 

  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, 
  };

  const localTime = new Intl.DateTimeFormat('en-US', options).format(date);

  return `${month}-${day}-${year} ${localTime}`;
};


