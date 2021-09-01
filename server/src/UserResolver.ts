import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware } from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { User } from './entity/User';
import { MyContext } from './MyContext';
import { createRefreshToken, createAccessToken } from './auth';
import { isAuth } from './isAuth';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: String
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hi!';
    }

    @Query(() => String)
    @UseMiddleware(isAuth)
    bye() {
        return 'hi!';
    }

    @Query(() => [User])
    users() {
        return User.find();
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string,
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
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new Error('could not find user');
            }
            const valid = await compare(password, user.password)
            if (!valid) {
                throw new Error('bad password');
            }

            // login successful

            res.cookie('jid', createRefreshToken(user),
                {
                    httpOnly: true
                }
            );

            return {
                accessToken: createAccessToken(user)
            };
        } catch (error) {
            console.log(error);
            return error;
        }
    }
}


