const convertUTCDateToLocalDate = function (utcDate: Date) {
    // Create a new Date object from the UTC time string.
    const utcTime = new Date(utcDate);
  
    // Get the current time zone offset in minutes.
    const timeZoneOffset = new Date().getTimezoneOffset();
  
    // Minus the time zone offset to the UTC time object.
    utcTime.setHours(utcTime.getHours() - timeZoneOffset / 60);
  
    // Format the converted time object to your desired format.
    const localTimeString = utcTime.toLocaleString('en-us');
  
    // Print the local time string.
    return localTimeString;
  };
  
  export { convertUTCDateToLocalDate };
  