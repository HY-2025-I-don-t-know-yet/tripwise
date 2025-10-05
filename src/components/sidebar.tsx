import { CarbonCard } from "./sidebar/carbonCard";
import { PreferenceCard } from "./sidebar/preferencesCard";
import { RouteCard } from "./sidebar/routeCard";
import { SafetyCard } from "./sidebar/safetyCard";

export function Sidebar() {
    return <div className="w-[420px] h-screen flex flex-col">
        <div className="m-4 bg-background/80 background-blur-md border border-border rounded-xl flex-1 flex flex-col shadow-lg overflow-scroll">
            <div className="flex flex-col mb-4">
                <RouteCard />
                <CarbonCard />
                <PreferenceCard />
                <SafetyCard />
            </div>
        </div>
    </div>;
}