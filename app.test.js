const User = require('./auth/models/userModel');

describe('User Model', () => {
  it('should create a new user', () => {
    const user = new User({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123'
    });

    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('johndoe@example.com');
    expect(user.password).toBe('password123');
  });
});