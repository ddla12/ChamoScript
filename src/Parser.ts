import { Token, ParseType, Parsed, ParsedToken, VariableExpressionBody, ParserObject, ParsedData, Arithmetic } from "./@types.ts";
import { ExpressionRegexp, Expressions, RegExpFactory, TypesRegExp } from "./constants.ts";

const operationParse = (value: string): any => {
    const toArray = (val: string): string[] => val.replace(/^\(|\)$/g, "")
        .replace(/^<|>$/g, "")
        .match(/\(.*\)|\S+/g)!;

    return toArray(value).map((val) => (val.includes("(")) ? operationParse(val) : val);
};

const Parsers: ParserObject = {
    number  : (value: string)   : ParsedData<number, "Number"> => [+(value), "Number", "NumberLiteral"],
    string  : (value: string)   : ParsedData<string, "String"> => [value + "", "String", "StringLiteral"],
    array   : (value: string)   : ParsedData<any[], "Array"> => {
        const array = value.replace(/^\[|\]$|\t|\n|\s+(?=\[|\])/g, "").split(/(?<=\]),/).map((e) => e.trim()).map(parseToken).filter(Boolean);

        return [array, "Array", "ArrayLiteral"]
    },
    arithmeticOperation: (value: string): ParsedData<string[], "Number"> => {
        const parseVals = (value: string|string[]): any => {
            return (typeof value !== "string")
                ? value.map(parseVals)
                : ((matchFactory(TypesRegExp.isNumber(), value))
                    ? Parsers.number
                    : Parsers.string
                )(value);
        };

        let tokens: string[] = operationParse(value).map(parseVals);

        return [tokens, "Number", "ArithmeticOperation"]
    },
};

const matchFactory = (regexp: RegExp, expression: string): string => (expression.match(regexp) || " ")[0].trim();

function parseToken(value: any): any {
    Object.values(TypesRegExp).some((callback) => {
        if(callback().test(value.trim())) {
            let prop = callback.name.replace("is", "");

            value = Parsers[
                prop[0].toLowerCase() + prop.substr(1)
            ](value);

            return true;
        }
    });

    return value;
}

function variableBody(expression: ParsedToken) {
    const match = (regexp: RegExp) => matchFactory(regexp, expression.value);

    expression.body = {
        type        : (expression.type === "ConstantDeclaration") ? "Constant" : "Variable",
        identifier  : match(RegExpFactory.variableIdentifier()),
        equality    : match(RegExpFactory.equality()),
        value       : parseToken(match(RegExpFactory.variableValue()))
    } as VariableExpressionBody;

    //@ts-ignore
    console.log(expression.body.value);
}

function generateBodyOfExpression(expression: ParsedToken) {
    switch(true) {
        case Expressions.Variable.includes(expression.type):
            return variableBody(expression);
        default:
            throw Error("Error");
    }
}

function sanitizeExpression(value: string) {
    let variableVal = matchFactory(RegExpFactory.variableValue(), value)
        .replace(RegExpFactory.sanitizeExpression(), "");

    return value.replace(RegExpFactory.variableValue(), " " + variableVal);
} 

function generateExpression(tokens: Token[], pos: number): [any, number] {
    let expression: ParsedToken = {
        type: "Invalid",
        value: "",
        body: {},
    };

    while(!Object.entries(ExpressionRegexp).some(([parse, regexp]) => {
        if(regexp.test(expression.value.trim())) {
            expression.type = parse as ParseType;
            return true;
        }
    }) && (pos < tokens.length)) {
        expression!.value += tokens[pos].value;
        pos++;
    }

    if(expression.type === "Invalid") throw SyntaxError("Expresion invalida");

    generateBodyOfExpression(expression);

    expression.value = sanitizeExpression(expression.value);

    return [expression, pos];
}

export default function Parser(tokens: Token[]): Parsed {
    let parsed: Parsed = {
        type: "Program",
        body: []
    }

    let pos: number = 0;

    while(pos < tokens.length) {
        if(tokens[pos].value === "\n") {
            pos++;
            continue;
        }

        let expression: any;

        [expression, pos] = generateExpression(tokens, pos);

        parsed.body.push(expression!);

        pos++;
    }

    return parsed;
}