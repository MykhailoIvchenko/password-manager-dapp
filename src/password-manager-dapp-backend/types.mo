  type Secret = {
    title : Text;
    website : Text;
    description : Text;
    encryptedData : Blob;
  };
  
  type User = {
    username : Text;
    secretKeyHash : Blob;
  };