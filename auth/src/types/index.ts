/**
 * Base user attributes
 */
interface BaseUserProperties {
  id: string;
  email: string;
  password: string;
}

/**
 * That describes the required props to create new user
 */
export type UserModel = Pick<BaseUserProperties, 'email' | 'password'>;

/**
 * Global types
 */
export interface Global {
  signup: (userMock: UserModel) => Promise<string>;
}
