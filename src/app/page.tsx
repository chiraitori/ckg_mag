//import Link from 'next/link';
//
//export default function Home() {
//  return (
//    <div className="flex flex-col items-center justify-center min-h-screen">
//      <h1 className="text-4xl font-bold mb-4 justify-center">Chicken Farm Management</h1>
//      <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
//        Login
//      </Link>
//    </div>
//  );
//}
//

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-center">Chicken Farm Management</h1>
      <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Login
      </Link>
    </div>
  );
}
