/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoginResponse, RegisterResponse, ValidateResponse } from '../auth.pb';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../auth.entity';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ValidateRequestDto,
} from '../auth.dto';
import { Repository } from 'typeorm';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  @InjectRepository(Auth)
  private readonly repository: Repository<Auth>;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  public async register({
    email,
    password,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    const conflict = await this.repository.findOne({ where: { email } });

    if (conflict) {
      const res = { status: HttpStatus.CONFLICT, errors: [] };
      res.errors.push('E-Mail already exists');
      console.log(res);
      return res;
    }

    const auth: Auth = {
      ...new Auth(),
      email: email,
      password: this.jwtService.encodePassword(password),
    };

    const res = await this.repository.save(auth);
    console.log(res);
    return { userUuid: res.uuid, status: HttpStatus.CREATED, errors: [] };
  }

  public async login({
    email,
    password,
  }: LoginRequestDto): Promise<LoginResponse> {
    const auth = await this.repository.findOne({ where: { email } });

    if (!auth) {
      return {
        errors: ['E-Mail not found'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    if (!this.jwtService.isPasswordValid(password, auth.password)) {
      return {
        errors: ['Password is wrong'],
        status: HttpStatus.NOT_FOUND,
      };
    }

    const token: string = this.jwtService.generateToken(auth);
    return { token, status: HttpStatus.OK, errors: [] };
  }

  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateResponse> {
    let decoded: Auth;

    try {
      decoded = await this.jwtService.verify(token);
    } catch (error) {
      return {
        status: HttpStatus.FORBIDDEN,
        errors: ['Token is invalid'],
      };
    }

    const auth = await this.jwtService.validateUser(decoded);
    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        errors: ['User not found'],
      };
    }

    return { status: HttpStatus.OK, errors: [], userUuid: decoded.uuid };
  }
}
