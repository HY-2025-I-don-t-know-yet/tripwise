import { CarbonCard } from "./sidebar/carbonCard";
import { PreferenceCard } from "./sidebar/preferencesCard";
import { RouteCard } from "./sidebar/routeCard";
import { SafetyCard } from "./sidebar/safetyCard";
import { Button } from "./ui/button";

export function Sidebar({ onRoute }: { onRoute: () => void }) {
    return <div className="w-[360px] h-screen flex flex-col">
        <div className="m-4 bg-background/80 background-blur-md border border-border rounded-xl flex-1 flex flex-col shadow-lg overflow-scroll">
            <div className="flex flex-col mb-6">
                <RouteCard />
                <CarbonCard />
                <PreferenceCard />
                <SafetyCard />
            </div>
            <Button className="m-2 bg-green-300 hover:bg-green-300/60" onClick={onRoute}>Plan My Trip</Button>
        </div>
    </div>;
}