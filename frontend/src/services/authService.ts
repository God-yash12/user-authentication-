
import type { RegistrationFormData, User, SimulatedRegistrationResponse } from '../types';

// Simulate a database of users
const simulatedUsers: User[] = [
  { id: '0', username: 'existinguser' }
];

export const registerUser = async (
  data: RegistrationFormData
): Promise<SimulatedRegistrationResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate username check
      if (simulatedUsers.find(user => user.username.toLowerCase() === data.username.toLowerCase())) {
        resolve({
          success: false,
          message: "Username already exists. Please choose another one.",
        });
        return;
      }

      // Simulate backend password strength check (though frontend does it too)
      // This is a basic check; a real backend would have more robust validation.
      if (data.password.length < 8) {
         resolve({
          success: false,
          message: "Password is too weak (simulated backend check).",
        });
        return;
      }
      
      // Simulate random server error
      // if (Math.random() < 0.1) { // 10% chance of error
      //   reject(new Error("A simulated network error occurred. Please try again."));
      //   return;
      // }

      const newUser: User = {
        id: String(simulatedUsers.length),
        username: data.username,
      };
      simulatedUsers.push(newUser); // "Store" the user

      resolve({
        success: true,
        message: "Registration successful!",
        user: newUser,
      });
    }, 1500); // Simulate network delay
  });
};
    