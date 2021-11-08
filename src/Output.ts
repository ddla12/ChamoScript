import { Parsed } from "./@types.ts";

function translateVariable() {}
function translate({ value }: { value: string}) {
    
};

export default function Output(parsed: Parsed): any {
    const values = parsed.body.map(translate).join("\n");

    return new Function(values)();
}