import { MapContainer } from "@/components/mapContainer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <MapContainer />
    </div>
  );
}
