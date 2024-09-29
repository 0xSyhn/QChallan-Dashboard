import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import('@/components/Maps'));

const  Page  = () => {
  return (
    <div>
      <MapComponent />
    </div>
  );
}

export default Page;  