const now  = new Date()

const expiresSession = new Date(now);
expiresSession.setDate(now.getDate() + 1);

console.log(expiresSession)