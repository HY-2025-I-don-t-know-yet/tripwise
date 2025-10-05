import { FigmaCheckbox } from "../figmed/checkbox";
import { Label } from "../ui/label";

export function PreferenceCard() {
    const options = [
        "Muzea",
        "Restauracje",
        "Sklepy",
        "Zabytki",
        "Parki",
        "Stacje benzynowe",
        "Hotele",
        "Punkty widokowe",
    ];

    // Split options into two columns
    const firstColumn = options.slice(0, 4);
    const secondColumn = options.slice(4, 10);

    return (
        <div className="space-y-2.5 p-3 bg-muted/20 rounded-lg w-full">
            <h2 className="text-lg font-semibold text-foreground">Preferences</h2>

            <div className="flex gap-8 mt-2">
                {/* First column */}
                <div className="flex flex-col gap-1">
                    {firstColumn.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                            <FigmaCheckbox id={option} />
                            <Label htmlFor={option} className="text-sm text-foreground">
                                {option}
                            </Label>
                        </div>
                    ))}
                </div>

                {/* Second column */}
                <div className="flex flex-col gap-1">
                    {secondColumn.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                            <FigmaCheckbox id={option} />
                            <Label htmlFor={option} className="text-sm text-foreground font-sans">
                                {option}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
