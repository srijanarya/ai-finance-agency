declare module 'compromise' {
  interface Doc {
    sentences(): any;
    match(pattern: string): any;
    normalize(): Doc;
    text(): string;
    terms(): any;
    has(pattern: string): boolean;
    words(): any;
    nouns(): any;
    verbs(): any;
    adjectives(): any;
  }

  function nlp(text: string): Doc;
  export = nlp;
}