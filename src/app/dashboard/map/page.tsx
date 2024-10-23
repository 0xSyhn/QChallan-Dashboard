import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import('@/components/Maps'), {ssr: false});

const  Page  = () => {
  return (
    <div>
      <MapComponent />
    </div>
  );
}

export default Page;  