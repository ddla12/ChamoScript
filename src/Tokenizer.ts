import { Token, TokenType } from "./@types.ts";
import { CSErrors, TokensRegexp, tryCatch } from "./constants.ts";

const ClosedStack = {
    stack: [] as string[],
    checkIf(value: string) {
        return ["``", "()", "{}", "[]"].some(
            (pair) => pair === (this.lastInStack() + value)
        )
    },
    lastInStack() {
        return this.stack[this.stack.length - 1];
    }
};

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

    tryCatch(Object.values(tokens).some(({ type, value }) => {
        if(type === "Invalid") {
            invalid = input.indexOf(value);
            return true;
        }
    }), CSErrors.tokenizer.tokenInesperado(invalid!));
}

function setClosed(tokens: Token[]): Token[] {
    let inString: boolean = false;

    return tokens.map(({ type, value }) => {
        let isGroupToken = "`{[()]}".includes(value),
            closed: boolean|undefined;

        if(ClosedStack.lastInStack() === "`") inString = !inString;

        if((isGroupToken) && (!inString)) {
            let inStack = ClosedStack.checkIf(value);
            
            closed = (inStack);

            (inStack)
                ? ClosedStack.stack.pop()
                : ClosedStack.stack.push(value);
        }

        return {
            type: (inString) ? "StringValue" : type,
            value,
            ...((closed !== undefined) && ({ closed })),
            ...((inString) && ({ inString }))
        }
    });
}

function checkForUnclosedTokens(tokens: Token[]): void {
    let closedVals: any[] = tokens.filter(({ closed }) => closed !== undefined);

    if(!closedVals.length) return;

    closedVals = closedVals.map(({ closed, value }) => ({ closed, value}));

    tryCatch(
        closedVals.filter(({ closed }) => closed).length !== closedVals.filter(({ closed }) => !(closed)).length,
        CSErrors.tokenizer.grupoSinCerrar(
            closedVals[closedVals.map(({ closed }) => closed).lastIndexOf(false)].value
        )
    );
}

export default function Tokenizer(input: string): Token[] {
    let tokens = getTokenTypes(getTokens(input));

    console.log(tokens);
    
    checkForSyntaxErrors(tokens, input);

    tokens = setClosed(tokens);

    checkForUnclosedTokens(tokens);

    return tokens;
}