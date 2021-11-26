import { Token, ParseType, Parsed, ParsedToken, VariableExpressionBody, ParserObject, ParsedData, Type, MultipleVariableExpression, Variables, ObjectExpressionBody, Props, Objetos } from "./@types.ts";
import { DefaultValues, ExpressionRegexp, Expressions, RegExpFactory, Translations, TypesRegExp } from "./constants.ts";

const program = {
    type: "Program",
    body: [] as any[],
    Variables: [] as Variables[],
    Objetos: [] as Objetos[],
    set objetos(values: Objetos[]) {
        this.objectExists(values);
        this.Objetos = values;
    },
    get objetos() {
        return this.Objetos;
    },
    set variables(value: Variables[]) {
        this.redeclareOrTyping(value);

        this.Variables = value;
    },
    get variables() {
        return this.Variables;
    },
    objectExists(values: Objetos[]) {
        const justIdentifiers = values.map(({ identifier }) => identifier);

        if(this.Objetos.map(({ identifier }) => identifier).some((id) => justIdentifiers.includes(id))) {
            throw Error("El objeto ya existe")
        }
    },
    redeclareOrTyping(values: Variables[]) {
        const justIdentifiers = values.map(({ identifier }) => identifier),
            typeAndId = values.map(({ type, identifier }) => ({ type, identifier }));

        if(this.variables.some(({ identifier }) => justIdentifiers.includes(identifier))) {
            throw Error("Error de identificador");
        }

        if(this.variables.map(({ identifier, type }) => ({ identifier, type }))
            .find((value) => typeAndId.includes(value))?.type 
        ) {
            throw Error("Error de tipo");
        }
    },
    find(id: string): void {
        if(!(this.variables.find(({ identifier }) => identifier === id))) {
            throw Error("Variable no existe")
        }
    }
}

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
    stringsConcatenation: (value: string): ParsedData<string, "String"> => [
        value.replace(/^<{2}|>{2}$/g, "").split("+").filter(Boolean).map(
            (t) => t.trim().replace(/^`|`$/g, "")
        ).join(""), 
        "String", 
        "StringsConcatenation"
    ],
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
    const match = (regexp: RegExp) => matchFactory(regexp, expression.value),
        parsedValue = parseToken(match(RegExpFactory.variableValue()));

    expression.body = {
        varType     : (expression.type === "ConstantDeclaration") ? "Constant" : "Variable",
        identifier  : match(RegExpFactory.identifier()),
        equality    : match(RegExpFactory.equality()),
        value       : parsedValue,
        type        : parsedValue[1]
    } as VariableExpressionBody;

    if(expression.type !== "VariableUpdating") {
        program.variables = [
            ...program.variables,
            (({ type, identifier, varType }: VariableExpressionBody) => ({
                type,
                identifier,
                varType,
            }))(expression.body as VariableExpressionBody) as Variables
        ];
    } else {
        program.find(expression.body.identifier!);
    }
}

function multipleVariables(expression: ParsedToken) {
    const variables = expression.value.match(/(?<=:)[\s\w,]+/g)! as string[],
        type = expression.value.match(RegExpFactory.multipleVariableTypes())![0] as Type;

    expression.body = {
        type,
        variables: variables.map((identifier): VariableExpressionBody => ({
            varType: "Variable",
            identifier: identifier!.trim(),
            equality: "es igual a",
            value: parseToken(DefaultValues[type]),
            type,
        }))
    } as MultipleVariableExpression;

    program.variables = [
        ...program.variables,
        ...((expression.body as MultipleVariableExpression).variables
            .map(({ identifier, type, varType }) => ({
                type: Translations.get(type),
                identifier: identifier!.trim(),
                varType,
            })) as Variables[])
    ];
}

function getObjectProps(expression: string): Props {
    return Object.fromEntries(
        expression.replace(/^.*{|};$/g, "").trim().split(";").filter(Boolean)
            .map((prop) => {
                let typeAndName = prop.split(" ").reverse();

                typeAndName[1] = Translations.get(typeAndName[1])!;

                return typeAndName;
            })
    )
}

function declareObject(expression: ParsedToken) {
    expression.body = {
        identifier: matchFactory(RegExpFactory.identifier("object"), expression.value),
        props: getObjectProps(expression.value),
        literal: {}
    } as ObjectExpressionBody;

    program.objetos.push(
        Object.assign({
            identifier: expression.body.identifier!,
            props: (expression.body as ObjectExpressionBody).props,
        },{})
    );
}

function generateBodyOfExpression(expression: ParsedToken) {
    switch(true) {
        case Expressions.Variable.includes(expression.type):
            return variableBody(expression);
        case (Expressions.MultipleVariable[0] === expression.type):
            return multipleVariables(expression);
        case Expressions.Object === expression.type:
            return declareObject(expression);
        default:
            throw Error("Error");
    }
}

function sanitizeExpression(value: string) {
    let variableVal = matchFactory(RegExpFactory.variableValue(), value)
        .replace(RegExpFactory.sanitizeExpression(), "");

    return value.replace(RegExpFactory.variableValue(), " " + variableVal);
} 

function generateExpression(tokens: Token[], pos: number, expressions: any[]): [any, number] {
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

export default function Parser(tokens: Token[]): any {
    let pos: number = 0;

    while(pos < tokens.length) {
        if(tokens[pos].value === "\n") {
            pos++;
            continue;
        }

        let expression: any;

        [expression, pos] = generateExpression(tokens, pos, program.body);

        program.body.push(expression!);

        pos++;
    }

    return program;
}