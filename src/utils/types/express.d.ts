// import { JwtPayload } from "jsonwebtoken";

// declare global {
//   namespace Express {
//     interface Request {
//       user?:  JwtPayload;
//     }
//   }
// }

// export {};

interface IUserPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

export {};
