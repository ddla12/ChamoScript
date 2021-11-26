import { ErrorObject } from "./@types.ts";

export const RawRegExp = {
    IdentifierName: String.raw`([\w$]+)`,
    Equality: String.raw`(es igual a|se le suma|se le divide|se le resta|se le multiplica|se eleva a)`,
    Types: String.raw`(Cadena|Arreglo|Objecto|Numero|Booleano)`,
};

export const TypesRegExp = {
    isNumber: () => /^[+-]?\d+(\.\d+)?$/,
    isString: () => /^`[^`]*`$/s,
    isArray : () => /^\[([\w\W]+,)\s*\]$/s,
    isArithmeticOperation: () => /(?<=^<)[0-9()+./*-\s]*(?<!>$)/,
    isStringsConcatenation: () => /(?<=^\<{2}\s*)(\+|`.*`+)(?=\s*\>{2}$)/
}

export const RegExpFactory = {
    variable(keyword: "ahora"|"var"|"siempre") {
        return new RegExp(
            String.raw`^${keyword}\s*${RawRegExp.IdentifierName}\s*${RawRegExp.Equality}\s*[\S\s]*\;$`
        );
    },
    identifier(type: "variable"|"object" = "variable") {
        return new RegExp(
            String.raw`(?<=${type === "variable" ? "(ahora|var|siempre)" : "Objeto"}\s)${RawRegExp.IdentifierName}`,
        );
    },
    equality: () => new RegExp(RawRegExp.Equality),
    variableValue() {
        return new RegExp(
            String.raw`(?<=${RawRegExp.Equality}\s*).*(?=;)`,
            "s"
        );
    },
    sanitizeExpression() {
        return new RegExp(
            String.raw`\t|\n|\s+(?=\]|\(|\)|:|,|\[|\(|\{)|\\n|(?<=\]|\(|\)|:|,|\[|\(|\{|;)\s+`,
            "g"
        );
    },
    validArrayElement: (isLast: boolean = false) => {
        return new RegExp(`^[\w\W]+${!isLast ? ",$" : ",?"}/`, "s");
    },
    validObjectElement: (isLast: boolean = false) => {
        return new RegExp(`^${RawRegExp.IdentifierName}:[\w\W]+${!isLast ? ",$" : ",?"}`, "s");
    },
    csType: () => new RegExp(`^${RawRegExp.Types}$`),
    multipleVariableTypes: () => new RegExp(`${RawRegExp.Types}`)
};

export const Translations = new Map([
    [ "siempre", "const" ],
    [ "var", "var" ],
    [ "imprimir", "console.log" ],
    [ "siempre es|es igual a", "=" ],
    [ "Cadena", "String" ],
    [ "Arreglo", "Array" ],
    [ "Numero", "Number" ],
    [ "Objeto", "Object"],
    [ "Booleano", "Boolean" ]
]);

export const ExpressionRegexp = {
    VariableDeclaration : RegExpFactory.variable("var"),
    VariableUpdating    : RegExpFactory.variable("ahora"),
    ConstantDeclaration : RegExpFactory.variable("siempre"),
    MultipleVariableDeclaration: new RegExp(
        String.raw`^declarar vars tipo ${RawRegExp.Types}:\s*(${RawRegExp.IdentifierName},)*\s*${RawRegExp.IdentifierName}\s*;$`
    ),
    ObjectDeclaration: new RegExp(
        String.raw`^Objeto [\w$]+\s*\{\s*(${RawRegExp.Types}\s*[\w$]+;\s*)*\s*\};$`
    )
};

export const TokensRegexp = {
    MultiLineComment: /\/\*|\*\//,
    IdentifierName: new RegExp("^" + RawRegExp.IdentifierName + "$"),
    LineTerminator: /\n|\r\n?/,
    StringLiteral: /(\`)/,
    NumericLiteral: /^[+-]?\d+(\.\d+)?$/,
    SingleLineComment: /\/\//,
    Punctuator: /\/|\\|\*|\+|\-|\(|\)|\[|\]|\{|\}|:|;|,|\.|\?|\¿|%|\^|<|>/,
    Whitespace: /\s+|\t+/,
};

export const JSKeywords = [
    "abstract",
    "arguments",
    "await*",
    "boolean",
    "break",
    "byte",	
    "case",	
    "catch",
    "char",	
    "class*",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "double",
    "else",
    "enum*",
    "eval",
    "export*",
    "extends*",
    "false",
    "final",
    "finally",
    "float",
    "for",
    "function",
    "goto",
    "if",
    "implements",
	"import*",
    "in",
    "instanceof",
    "int",
    "interface",
    "let*",
    "long",
    "native",
    "new",
    "null",	
    "package",
    "private",
    "protected",
    "public",
    "return",	
    "short",
    "static",
    "super*",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "true",
    "try",
    "typeof",
    "void",
    "volatile",
    "while",
    "with",
    "yield",
];

export const Expressions = {
    Variable: ["VariableDeclaration", "VariableUpdating", "ConstantDeclaration"],
    MultipleVariable: ["MultipleVariableDeclaration"],
    Object: "ObjectDeclaration"
};

export const tryCatch = (
    condition       : boolean,
    error           : string,
    errorInstance   : ((message?: string) => Error) = SyntaxError
): void => {
    try {
        if(condition) throw errorInstance(error);        
    } catch (error) {
        throw error;
    }
};

export const CSErrors: ErrorObject = {
    tokenizer: {
        tokenInesperado: (pos: number) => `Token inesperado en la posicion ${pos}`,
        grupoSinCerrar: (grupo: string) => `Grupo sin cerrar, se esperaba '${grupo}'`,
    },
    parser: {
        elementoInvalido: (element: string, type: "arreglo"|"objeto") => {
            return `${type === "arreglo" ? "Elemento" : "Propiedad"} de ${type} inválido, ${element}`
        }
    }
};

export const DefaultValues: Record<string, string> = {
    Cadena   : "",
    Arreglo  : "[]",
    Booleano : "falso",
    Objeto   : "{}"
};

