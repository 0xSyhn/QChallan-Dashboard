import Link from 'next/link';
import logo from "./../../../assets/logo.png"
import NavLinks from '../nav-links';
import Image from 'next/image';


export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 ">
      <Link
       //className="mb-4 flex h-10 items-end justify-start rounded-md  p-4 md:h-40"
        href="/"
      >
      <div className=' pb-4 pt-2 flex justify-center items-center'>

        <div className="w-32  font-bold md:w-40 gap-4  flex justify-center items-center">
          <Image src={logo} alt="Goa Police" width={50} height={50} />  
          Goa Police
        </div>
      </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
      </div>
    </div>
  );
}
