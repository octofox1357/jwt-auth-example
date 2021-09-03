import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
// typeorm의 schema를 그대로 graphql의 type으로 지정한다. 이것이 typeorm과 type-graphql의 조합이 좋은 이유다.
// graphql은 resolver만 작성하면 된다.

// It marks the class as the type known from the GraphQL SDL or GraphQLObjectType from graphql-js
@ObjectType() // type-graphql의 타입으로 사용하기 위한 데코레이터.
@Entity("users") // 테이블의 이름을 직접 지정한다.
export class User extends BaseEntity {
  @Field(() => Int) // type-graphql에서 사용할 필드 지정
  @PrimaryGeneratedColumn()
  id: number;

  @Field() // type-graphql에서 사용할 필드 지정
  @Column("text") // postgre 컬럼 데이터 타입을 직접 지정한다.
  email: string;

  @Column("text") // Field 데코레이터가 없다면 쿼리 할 수 없음
  password: string;
}
