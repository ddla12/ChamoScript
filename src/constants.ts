import { ParseType } from "./@types.ts";

export const RawRegExp = {
    IdentifierName: String.raw`((\$|\_|[a-zA-Z])+)[_a-zA-Z0-9]{0,}`,
    Equality: String.raw`(es igual a|se le suma|se le divide|se le resta|se le multiplica|se eleva a)`
};

export const TypesRegExp = {
    isNumber: () => /^-?[0-9]+(\.[0-9]+)?$/,
    isString: () => /^("|').*\1/s,
    isArray : () => /^\[\s*([\w\W]+,\s*)*([\w\W]+\s*)*\s*\]$/s,
    isObject: () => /^\{\s*(((\$|\_|[a-zA-Z])+)[_a-zA-Z0-9]{0,}\s*:\s*[ a-z0-9A-Z"'\[\]]+,{1}\s?)*\s*\}$/s,
    isArithmeticOperation: () => /(?<=^<)[0-9\+\-\/\*\.\(\)\s]*(?=>$)/
}

export const RegExpFactory = {
    variable(keyword: "ahora"|"var"|"siempre") {
        return new RegExp(
            String.raw`^${keyword}\s*${RawRegExp.IdentifierName}\s*${RawRegExp.Equality}\s*[\S\s]*\;$`
        );
    },
    variableIdentifier() {
        return new RegExp(
            String.raw`(?<=(ahora|var|siempre)\s)${RawRegExp.IdentifierName}`,
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
    }
};

export const CSKeywords = new Map<string, [string, ParseType]>([
    [
        "const", 
        ["const", "VariableDeclaration"]
    ],
    [
        "var", 
        ["var", "VariableDeclaration"]
    ],
    [
        "imprimir", 
        ["console.log", "FunctionCall"]
    ],
    [
        "siempre es",
        ["=", "Equality"]
    ]
]);

export const ExpressionRegexp = {
    VariableDeclaration : RegExpFactory.variable("var"),
    VariableUpdating    : RegExpFactory.variable("ahora"),
    ConstantDeclaration : RegExpFactory.variable("siempre"),
};

export const TokensRegexp = {
    MultiLineComment: /\/\*|\*\//,
    IdentifierName: new RegExp(RawRegExp.IdentifierName + "$"),
    LineTerminator: /\n|\r\n?/,
    StringLiteral: /(\'|\")/,
    NumericLiteral: /^-?[0-9]+(\.[0-9]+)?$/,
    SingleLineComment: /\/\//,
    Punctuator: /\/|\\|\*|\+|\-|\(|\)|\[|\]|\{|\}|:|;|,|\.|\?|\¿|%|\^|"|'|`|<|>/,
    Whitespace: /\s+|\t+/,
};

export const ArithmeticSymbol = {
    addition: "+"
}

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
};