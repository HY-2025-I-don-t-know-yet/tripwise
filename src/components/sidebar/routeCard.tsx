import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export function RouteCard() {
    return (
        <form className="space-y-2.5 p-3 bg-muted/20 rounded-lg w-full">
            <h2 className="text-lg font-semibold text-foreground">Route Planning</h2>

            <div className="flex flex-col gap-2">
                <Input id="startStreet" placeholder="Enter starting point" />
                <Input id="destinationStreet" placeholder="Enter destination" />
            </div>

            <div>
                <Label className="text-sm text-muted-foreground">Transport Mode</Label>
                <RadioGroup defaultValue="car" className="flex flex-row justify-around mt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="car" id="car" />
                        <Label htmlFor="car">Car</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="train" id="train" />
                        <Label htmlFor="train">Train</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bicycle" id="bicycle" />
                        <Label htmlFor="bicycle">Bicycle</Label>
                    </div>
                </RadioGroup>
            </div>
        </form>
    );
}
