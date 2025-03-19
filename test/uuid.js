function generateRandomId(role, registrationDate) {
    let result = "";
    const characters = "1234567890";
    const charactersLength = characters.length;
  
    // Format tanggal pendaftaran (YYYYMMDD)
    const date = new Date(registrationDate);
    const formattedDate = date.getFullYear().toString() +
                          String(date.getMonth() + 1).padStart(2, "0") +
                          String(date.getDate()).padStart(2, "0");
  
    // Generate angka acak sebanyak 5 digit
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    // Pastikan angka tidak dimulai dari 0
    if (result.startsWith("0")) {
      result = result.replace("0", "1");
    }
  
    // Format sesuai role
    if (role.toLowerCase() === "pelajar") {
      return `P-${formattedDate}-${result}`;
    } else {
      return `U-${formattedDate}-${result}`; // Format default untuk role lain
    }
  }
  
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  console.log(generateOTP())
  // Contoh penggunaan
  console.log(generateRandomId("pelajar", "2025-03-01")); 
  // Output contoh: P-20250301-84937
  