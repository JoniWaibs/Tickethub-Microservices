import { Schema, model } from 'mongoose';
import { UserModel } from '../types';
import { Password } from '../utils/hash-password';

const userSchema = new Schema<UserModel>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    toJSON: {
      /**
       * Mongoose will transform the returned object
       * @param _doc
       * @param ret
       */
      transform(_doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

/**
 * Intercepts attempt to save the new user
 * Then it will hash the password previously added
 * and will subscribe this password
 */
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

/**
 * Expose User model
 */
export const User = model<UserModel>('User', userSchema);
