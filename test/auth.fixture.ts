import { LoginRequestDto, RegisterRequestDto } from 'src/auth/auth.dto';
import { Role } from 'src/auth/auth.enum';

export const registerFixture: RegisterRequestDto = {
  email: 'test@example.com',
  password: '12345678',
  role: Role.User,
};

export const loginFixture: LoginRequestDto = {
  email: 'test@example.com',
  password: '12345678',
};

export const incorrectLoginFixture: LoginRequestDto = {
  email: 'test@example.com',
  password: '12345678910',
};

export const authFixture = {
  id: 1,
  email: 'test@example.com',
  uuid: 'generated-uuid',
  password: '$2b$10$yVJMDZuh83zEeNp5Luhh9efpFPa.R8FBK7NoHEQ/5psMUUZ.luaBO',
};
