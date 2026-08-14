export const environment = {
  production: false,
  apiUrl: "http://localhost:8080/api",
  // En dev, billing et attendance sont dans le même monolithe sur 8080
  billingApiUrl: "http://localhost:8080/api",
  attendanceApiUrl: "http://localhost:8080/api",
  apiSettings: {
    disablePropertyNameConversion: false, // Active la conversion automatique
  },
};
