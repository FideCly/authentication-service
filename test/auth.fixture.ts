import { LoginRequest, RegisterRequest } from 'src/auth/auth.pb';

export const registerFixture: RegisterRequest = {
  email: 'test@example.com',
  password: '12345678',
};

export const loginFixture: LoginRequest = {
  email: 'test@example.com',
  password: '12345678',
};

export const incorrectLoginFixture: LoginRequest = {
  email: 'test@example.com',
  password: '12345678910',
};

export const authFixture = {
  id: 1,
  email: 'test@example.com',
  uuid: 'generated-uuid',
  password: '$2b$10$yVJMDZuh83zEeNp5Luhh9efpFPa.R8FBK7NoHEQ/5psMUUZ.luaBO',
};
