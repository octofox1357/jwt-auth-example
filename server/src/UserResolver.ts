import {
  Resolver, // 데코레이터
  Query,
  Mutation,
  Arg,
  ObjectType,
  Field,
  Ctx,
  UseMiddleware,
} from "type-graphql"; // type-graphql은 기본적으로 데코레이터를 잘 숙지하여야한다.
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { User } from "./entity/User";
import { MyContext } from "./MyContext";
import { createRefreshToken, createAccessToken } from "./auth";
import { isAuth } from "./isAuth";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: String;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  @UseMiddleware(isAuth)
  bye() {
    return "bye!";
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    // 회원가입
    @Arg("email") email: string,
    @Arg("password") password: string
  ) {
    try {
      const hashedPassword = await hash(password, 10);
      await User.insert({
        email,
        password: hashedPassword,
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    // 로그인
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { res }: MyContext // res, req로 접근 가능하다.
  ): Promise<LoginResponse> {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("could not find user");
      }
      const valid = await compare(password, user.password);
      if (!valid) {
        throw new Error("bad password");
      }
      res.cookie("jid", createRefreshToken(user), {
        httpOnly: true,
      });
      return {
        accessToken: createAccessToken(user),
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
