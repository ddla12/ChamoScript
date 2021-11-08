import { Token, TokenType } from "./@types.ts";
import { TokensRegexp } from "./constants.ts";

const closedStack: string[] = [];

const inClosedStack = (value: string) => [`""`, "''", "()", "{}", "[]"].some(
    (pair) => pair === (closedStack[closedStack.length - 1] + value)
);

const getTokens = (input: string): string[] => input.trim().match(/\n|\s+|\w+|\W/g)!.filter(Boolean);

function getTokenTypes(tokens: string[]): Token[] {
    return tokens.map((value) => {
        let type: TokenType = "Invalid";

        Object.entries(TokensRegexp).some(([t, regexp]) => {
            if(regexp.test(value)) {
                type = t as TokenType;
                return true;
            }
        });

        return {
            type,
            value,
        }
    });
}

function checkForSyntaxErrors(tokens: Token[], input: string): void {
    let invalid: number;

    if(Object.values(tokens).some(({ type, value }) => {
        if(type === "Invalid") {
            invalid = input.indexOf(value);
            return true;
        }
    })) {
        throw SyntaxError(`Token inesperado en la posicion ${invalid!}`);
    }  
}

function setClosed(tokens: Token[]): Token[] {
    let inString: boolean = false,
        quoteType: string = "";

    return tokens.map(({ type, value }) => {
        let isGroupToken = `"'{[()]}`.includes(value),
            closed: boolean|undefined;

        if(`"'`.includes(value) && (["", value].includes(quoteType))) {
            inString = !inString;
            quoteType = value;
        }

        let isStringValue = (inString && (quoteType !== value));

        if((isGroupToken) && (!isStringValue)) {
            let inStack = inClosedStack(value);
            
            closed = (inStack);

            (inStack)
                ? closedStack.pop()
                : closedStack.push(value);
        }

        return {
            type: (isStringValue) ? "StringValue" : type,
            value,
            ...((closed !== undefined) && ({ closed })),
            ...((inString && (isStringValue)) && ({ inString }))
        }
    });
}

function checkForUnclosedTokens(tokens: Token[]): void {
    const closedVals = tokens.filter(({ closed }) => closed !== undefined).map(({ closed }) => closed);

    if(closedVals.filter(Boolean).length !== closedVals.filter((v) => !v).length) {
        throw SyntaxError("Grupo sin cerrar");
    }
}

export default function Tokenizer(input: string): Token[] {
    let tokens = getTokenTypes(getTokens(input));

    checkForSyntaxErrors(tokens, input);

    tokens = setClosed(tokens);

    checkForUnclosedTokens(tokens);

    return tokens;
}