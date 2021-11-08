import { JSKeywords } from "./constants.ts";
import Tokenizer from "./Tokenizer.ts";
import Parser from "./Parser.ts"

export default function Transpiler(program: string): void {
    if(JSKeywords.some((keyword) => new RegExp(`/${keyword}/`, "g").test(program))) {
        throw SyntaxError(
            `No puedes usar palabras reservadas de Javascript en Chamoscript`
        );
    }

    let tokens = Tokenizer(program),
        parser = Parser(tokens);

    console.log(parser);
    //output = Output(parser);

    //return output;
};