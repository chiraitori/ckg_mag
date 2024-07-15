//import 'next-auth';
//
//declare module 'next-auth' {
//  interface User {
//    isAdmin?: boolean;
//    isDirector?: boolean;
//  }
//  
//  interface Profile {
//    isAdmin?: boolean;
//    Username?: string;
//  }
//  
//  interface Session {
//    user?: User;
//    profile?: Profile;
//  }
//}

import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    isAdmin?: boolean;
    isDirector?: boolean;
  }

  interface Session {
    user?: User;
  }
}