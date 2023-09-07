import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from './jwt.service';
import {
  RegisterRequestDto,
  LoginRequestDto,
  ValidateRequestDto,
} from '../auth.dto';
import { Auth } from '../auth.entity';
import { LoginResponse, RegisterResponse, ValidateResponse } from '../auth.pb';

@Injectable()
export class AuthService {
  @InjectRepository(Auth)
  private readonly repository: Repository<Auth>;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  public async register({
    email,
    password,
    role,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    let auth: Auth = await this.repository.findOne({ where: { email } });

    if (auth) {
      return { status: HttpStatus.CONFLICT, errors: ['E-Mail already exists'] };
    }

    auth = new Auth();
    auth.email = email;
    auth.password = this.jwtService.encodePassword(password);
    auth.role = role;

    const res = await this.repository.save(auth);

    return { status: HttpStatus.CREATED, errors: null, userUuid: res.uuid };
  }

  public async login({
    email,
    password,
  }: LoginRequestDto): Promise<LoginResponse> {
    const auth: Auth = await this.repository.findOne({ where: { email } });

    if (!auth) {
      return {
        status: HttpStatus.NOT_FOUND,
        errors: ['E-Mail not found'],
        token: null,
        userUuid: null,
      };
    }

    const isPasswordValid: boolean = this.jwtService.isPasswordValid(
      password,
      auth.password,
    );

    if (!isPasswordValid) {
      return {
        status: HttpStatus.NOT_FOUND,
        errors: ['Password wrong'],
        token: null,
        userUuid: null,
      };
    }

    const token: string = this.jwtService.generateToken(auth);

    return { token, userUuid: auth.uuid, status: HttpStatus.OK, errors: null };
  }

  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateResponse> {
    const decoded: Auth = await this.jwtService.verify(token);

    if (!decoded) {
      return {
        status: HttpStatus.FORBIDDEN,
        errors: ['Token is invalid'],
        userUuid: null,
        role: null,
      };
    }

    const auth: Auth = await this.jwtService.validateUser(decoded);

    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        errors: ['User not found'],
        userUuid: null,
        role: null,
      };
    }

    return {
      status: HttpStatus.OK,
      errors: null,
      userUuid: decoded.uuid,
      role: decoded.role,
    };
  }
}
