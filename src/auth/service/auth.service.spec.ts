import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { jwtConstants } from '../constants';
import { HttpStatus } from '@nestjs/common';

const oneUser = {
  id: 3,
  username: 'toto',
  email: 'toto@example.com',
  password: '$2b$10$8EYleQa1AQezymjO/tVVeu8S04EMXB6s/10ACztXlOQc7L/3ofZAW',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '60s' },
        }),
      ],
      providers: [AuthService],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser()', () => {
    it('should return a user object when credentials are valid', async () => {
      const res = await service.validate({
        token: 'xxxxx',
      });
      expect(res.userId).toEqual(3);
      expect(res.status).toEqual(HttpStatus.OK);
      expect(res.error.length).toEqual(0);
    });

    it('should return null when credentials are invalid', async () => {
      const res = await service.validate({
        token: 'xxxxx',
      });
      expect(res.userId).toEqual(-1);
      expect(res.status).toEqual(HttpStatus.FORBIDDEN);
      expect(res.error.length).toEqual(1);
    });
  });

  describe('login()', () => {
    it('should return JWT object when credentials are valid', async () => {
      const res = await service.login(oneUser);
      expect(res.token).toBeDefined();
    });
  });
});
